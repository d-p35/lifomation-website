import { Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import { Repository } from "typeorm";
import { Document } from "../models/document";
import multer from "multer";
import path from "path";
import moment from 'moment';

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

DocumentsRouter.post(
  "/",
  upload.single("document"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const document = {
        document: file,
      } as any;

      // Save document
      const newDocument = await documentRepository.save(document);

      // Return the new document
      res.status(201).json({document: newDocument});
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

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
