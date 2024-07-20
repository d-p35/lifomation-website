import { Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import { Repository } from "typeorm";
import { Document } from "../models/document";
import multer from "multer";
import path from "path";
import axios from "axios";
import * as fs from "fs"; // Import the 'fs' module instead of 'fs/promises'
import extract from "extract-zip";
import { v4 as uuidv4 } from "uuid"; // To generate unique IDs
import moment from "moment";
import tesseract from "tesseract.js";
import { processImageFile } from "../services/extractTextService";
import { processPdfFile } from "../services/extractTextService";
import { MeiliSearch } from "meilisearch";


require("dotenv").config();

const upload = multer({ dest: "uploads/" });
const client = new MeiliSearch({ host: 'http://localhost:7700' });
const index = client.index('documents');

export const DocumentsRouter = Router();

const documentRepository: Repository<Document> =
  dataSource.getRepository(Document);

DocumentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const rows = parseInt(req.query.rows as string) || 10;
    const ownerId = req.body.userId;

    const [documents, count] = await documentRepository.findAndCount({
      skip: page * rows,
      take: rows,
      order: { uploadedAt: "DESC" },
      where: { ownerId: ownerId },
    });

    res.status(200).json({ count, documents });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


DocumentsRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log(`Searching for ${query} by user ${userId}`);

    const searchResults = await index.search(query, {
      filter: `ownerId = "${userId}"`
    });

    res.status(200).json(searchResults.hits);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});


DocumentsRouter.get("/recent", async (req: Request, res: Response) => {
  try {
    const ownerId = req.body.userId;
    const allDocuments = await documentRepository.find({
      order: { lastOpened: "DESC" },
      take: 10,
      where: { ownerId: ownerId },
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

DocumentsRouter.post(
  "/",
  upload.single("document"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const ownerId = req.body.userId;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      if (!ownerId) {
        return res.status(400).json({ message: "User is not logged in" });
      }
      const processFunction =
        file.mimetype !== "application/pdf" ? processImageFile : processPdfFile;
      try {
        let {document, text, classificationResult} = await processFunction(file, ownerId, res);

        if (classificationResult.length === 0) {
          return res.status(500).json({ message: "Failed to classify document" });
        }
        document.category= classificationResult[0].split(',').map((category: string) => category.trim()).join(',');
        const newDocument = await documentRepository.save(document);
        const success = await index.addDocuments([{ id: newDocument.id, title:newDocument.document.originalname, text: text, ownerId, category: classificationResult }], {primaryKey: 'id'});

        res.status(201).json({ document: newDocument });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save document" });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: "Failed to process document" });
    }
  }
);

DocumentsRouter.patch("/category/:id", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);
    const category = req.body.category;
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.category = category;
    const updatedDocument = await documentRepository.save(document);
    index.updateDocuments([{ id: updatedDocument.id, category: category }], {primaryKey: 'id'});

    res.status(200).json({ document: updatedDocument });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.patch(
  "/lastOpened/:id",
  async (req: Request, res: Response) => {
    try {
      // Update lastOpened
      const id: number = parseInt(req.params.id);
      const document = await documentRepository.findOne({ where: { id: id } });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      document.views = document.views + 1;
      await documentRepository.save(document);

      // Return the new document
      res.status(200).json({ document });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
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
    const filePath = path.join(__dirname, "../uploads", document.document.filename);

    index.deleteDocument(document.id);
    // Delete document
    await documentRepository.delete(document.id);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file: ", err);
        return res.status(500).json({ message: "Error deleting file" });
      }
    });

    // Return the new document
    res.status(204).json();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
