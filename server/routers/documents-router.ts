import { Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import { Repository } from "typeorm";
import { Document } from "../models/document";
import multer from "multer";
import path from "path";
import axios from 'axios';

const tikaServerUrl = 'http://localhost:9998/tika'; 
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
    try {
      const file = req.file;

      // Prepare data for POST request to Tika server
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      // Send the file to Tika server for processing
      const tikaResponse = await axios.post(tikaServerUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (tikaResponse.status === 200) {
        const extractedData = tikaResponse.data; // This could be text or metadata

        // Save the document with extracted data (optional)
        const document = {
          document: file,
          extractedData, // Add the extracted data to the document object
        };

        const newDocument = await documentRepository.save(document);

        // Return the new document with extracted data
        res.status(201).json({ document: newDocument });
      } else {
        throw new Error('Error processing document with Tika');
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: 'Failed to process document' });
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
