import { Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import { Repository } from "typeorm";
import { Document } from "../models/document";
import multer from "multer";
import path from "path";
import axios from 'axios';
import * as fs from 'fs'; // Import the 'fs' module instead of 'fs/promises'
import extract from "extract-zip"; 
import { v4 as uuidv4 } from "uuid"; // To generate unique IDs
import moment from 'moment';

require('dotenv').config();

const upload = multer({ dest: "uploads/" });
export const DocumentsRouter = Router();

const documentRepository: Repository<Document> =
  dataSource.getRepository(Document);

DocumentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const allDocuments = await documentRepository.find();
    const count = await documentRepository.count();
    res.status(200).json({ count, documents: allDocuments });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
DocumentsRouter.get("/recent", async (req: Request, res: Response) => {
  try {
    const allDocuments = await documentRepository.find({
      order: { lastOpened: "DESC" },
    });
    const count = await documentRepository.count();
    res.status(200).json({ count, documents: allDocuments });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.get("/:id/file", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.setHeader("Content-Type", document.document.mimetype);
    res.sendFile(document.document.path, { root: path.resolve() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.post("/", upload.single("document"), async (req: Request, res: Response) => {
  let parsingData;
  try {
    const file = req.file; // Cast the request file to UploadFile type
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uniqueFolderName = uuidv4();
    const documentFolder = path.join(__dirname, "../uploads", uniqueFolderName);
    const imagesFolder = path.join(documentFolder, "images");
    const metadataFilePath = path.join(documentFolder, "metadata.txt");
    const textdataFilePath = path.join(documentFolder, "text.txt");

    // Create necessary directories
    await fs.promises.mkdir(documentFolder, { recursive: true });
    await fs.promises.mkdir(imagesFolder, { recursive: true });

    const fileHandle = await fs.promises.open(file.path, "r"); // Open the uploaded file
    parsingData = fileHandle.createReadStream(); // Create a read stream from the file handle

    // Prepare data for PUT request to Tika server
    const tikaResponse = await axios({
      method: "PUT",
      url: "http://localhost:9998/unpack/all", // endpoint for images and text extraction
      data: parsingData, // Stream the file data directly
      responseType: "stream", // Receive response as a stream for writing
      headers: {
        "X-Tika-PDFExtractInlineImages": "true",
        "X-Tika-PDFExtractUniqueInlineImagesOnly": "true",
        "Content-Type": "application/octet-stream",
      },
    });

    if (tikaResponse.status === 200) {
      let extractedText = "";
      let metadataText = "";
      const tempDir = path.join(documentFolder, "temp");

      // Create necessary directories
      await fs.promises.mkdir(tempDir, { recursive: true });

      tikaResponse.data.pipe(fs.createWriteStream(path.join(tempDir, "tika-output.zip"))).on("finish", async () => {
        await extract(path.join(tempDir, "tika-output.zip"), { dir: tempDir });

        const files = await fs.promises.readdir(tempDir);
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stat = await fs.promises.stat(filePath);
          if (stat.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (file === "__METADATA__") {
              const metadata = await fs.promises.readFile(filePath, "utf-8");
              metadataText += metadata;
            }
            else if (file === "__TEXT__"){
              const text = await fs.promises.readFile(filePath, "utf-8");
              extractedText += text;
            }
            else if (ext === ".jpg" || ext === ".png" || ext === ".jpeg") {
              const newImagePath = path.join(imagesFolder, file);
              await fs.promises.rename(filePath, newImagePath);
            }
          }
        }
        
        // Todo: @d-p35: The extracted text 

        await fs.promises.writeFile(metadataFilePath, metadataText);
        await fs.promises.writeFile(textdataFilePath, extractedText);

        const document = {
          document: file,
        } as any;

        // Save the document
        const newDocument = await documentRepository.save(document);
        res.status(201).json({ document: newDocument });
      });
    } else {
      throw new Error("Error processing document with Tika");
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to process document" });
  } finally {
    // Ensure the file stream is closed regardless of success or error
    if (parsingData) {
      await parsingData.close();
    }
  }
});


DocumentsRouter.patch("/lastOpened/:id", async (req: Request, res: Response) => {
  try {
    // Update lastOpened
    const id: number = parseInt(req.params.id);
    const document = await documentRepository.findOne({ where: { id: id } });


    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    // document.lastOpened = new Date(req.body.time);
  
    await documentRepository.save(document);

    // Return the new document
    res.status(200).json({ document
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);

    // Find document by id
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    // Delete document
    await documentRepository.delete(document.id);

    // Return the new document
    res.status(204).json();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
