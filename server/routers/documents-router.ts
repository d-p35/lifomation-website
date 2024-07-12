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

const tikaServerUrl = 'http://localhost:9998/tika/form'; 
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

DocumentsRouter.post(
  "/",
  upload.single("document"),
async (req: Request, res: Response) => {
    let parsingData;
    try {
      const file = req.file; // Cast the request file to UploadFile type
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileHandle = await fs.promises.open(file.path, "r"); // Open the uploaded file
      parsingData = fileHandle.createReadStream(); // Create a read stream from the file handle

      // Prepare data for PUT request to Tika server
      const tikaResponse = await axios({
        method: "PUT",
        url: "http://localhost:9998/unpack/all",
        data: parsingData, // Stream the file data directly
        responseType: "stream", // Receive response as a stream for writing
        headers: {
          "X-Tika-PDFExtractInlineImages": "true",
          "X-Tika-PDFExtractUniqueInlineImagesOnly": "true",
          "Content-Type": "application/octet-stream",
        },
      });

      if (tikaResponse.status === 200) {
        const outputFilename = __dirname + "/output.zip";
        const writeStream = fs.createWriteStream(outputFilename);

        tikaResponse.data.pipe(writeStream); // Pipe the response stream to the output file

        writeStream.on("finish", () => {
          console.log("Tika-server response data saved at", outputFilename);
          // Save the document with extracted data (optional)
          // ... your logic to access extracted data and save the document ...

          // Return a success response (assuming you saved the document)
          res.status(201).json({ message: "Document processed and saved" });
        });

        writeStream.on("error", (err) => {
          console.error("Error saving Tika-server response:", err);
          res.status(500).json({ message: "Failed to process document" });
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
  }
);


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
