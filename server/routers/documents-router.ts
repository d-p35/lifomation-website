import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import { Repository, Like } from "typeorm";
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
import { DocumentPermission } from "../models/documentPermission";

require("dotenv").config();


const upload = multer({ dest: "uploads/" });
const client = new MeiliSearch({ host: "http://localhost:7700" });
const index = client.index("documents");

export const DocumentsRouter = Router();

const documentRepository: Repository<Document> =
  dataSource.getRepository(Document);
const documentPermissionRepository: Repository<DocumentPermission> =
  dataSource.getRepository(DocumentPermission);
  
// Middleware to check permissions
const checkPermission = (requiredAccessLevel: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware executed");

    const documentId = parseInt(req.params.id);
    const userId = req.body.userId || req.query.userId || req.headers['user-id'];

    console.log(`Document ID: ${documentId}`);
    console.log(`User ID: ${userId}`);

    if (!userId) {
      console.log("Permission denied: User ID is missing");
      return res.status(400).json({ message: "User ID is required" });
    }

    const document = await documentRepository.findOne({ where: { id: documentId }, relations: ["permissions"] });

    console.log(`Document: ${JSON.stringify(document)}`);

    if (!document) {
      console.log("Document not found");
      return res.status(404).json({ message: "Document not found" });
    }

    const permission = document.permissions.find(p => p.userId === userId);
    console.log(`Found permission: ${JSON.stringify(permission)}`);

    const accessLevels = ["read", "edit", "full"];
    const userAccessLevelIndex = accessLevels.indexOf(permission?.accessLevel || "none");
    const requiredAccessLevelIndex = accessLevels.indexOf(requiredAccessLevel);

    console.log(`User access level index: ${userAccessLevelIndex}`);
    console.log(`Required access level index: ${requiredAccessLevelIndex}`);

    if (userAccessLevelIndex < requiredAccessLevelIndex) {
      console.log("Permission denied: Insufficient access level");
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};


// Add a permission to a document
DocumentsRouter.post("/:id/share", async (req: Request, res: Response) => {
  try {
    const documentId: number = parseInt(req.params.id);
    const { userId, accessLevel } = req.body.userId;

    const document = await documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const newPermission = new DocumentPermission();
    newPermission.documentId = documentId;
    newPermission.userId = userId;
    newPermission.accessLevel = accessLevel;

    await documentPermissionRepository.save(newPermission);

    res.status(201).json({ message: "Permission added" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get permissions for a document
DocumentsRouter.get("/:id/permissions", async (req: Request, res: Response) => {
  try {
    const documentId: number = parseInt(req.params.id);
    const permissions = await documentPermissionRepository.find({ where: { documentId: documentId } });

    res.status(200).json({ permissions });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a permission from a document
DocumentsRouter.delete("/:id/share", async (req: Request, res: Response) => {
  try {
    const documentId: number = parseInt(req.params.id);
    const { userId } = req.body.userId;

    await documentPermissionRepository.delete({ documentId: documentId, userId: userId });

    res.status(204).json();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Your existing router code
DocumentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const rows = parseInt(req.query.rows as string) || 10;
    const ownerId = req.query.userId;
    const categoryName = req.query.categoryName as string;
    
    let whereClause = { ownerId: ownerId } as any;
    if (categoryName) {
      whereClause.category = Like(`${categoryName},%`);
    }

    console.log(ownerId)

    const [documents, count] = await documentRepository.findAndCount({
      skip: page * rows,
      take: rows,
      order: { uploadedAt: "DESC" },
      where: whereClause,
    });

    res.status(200).json({ count, documents });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.get("/star", async (req: Request, res: Response) => {
  try {
    const ownerId = req.body.userId;
    const allDocuments = await documentRepository.find({
      order: { lastOpened: "DESC" },
      where: { ownerId: ownerId, starred: true },
    });
    const count = await documentRepository.count();
    res.status(200).json({ count, documents: allDocuments });
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
      filter: `ownerId = "${userId}"`,
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

DocumentsRouter.get("/:id", checkPermission("read"), async (req: Request, res: Response) => {
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

DocumentsRouter.get("/:id/file", checkPermission("read" ), async (req: Request, res: Response) => {
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
  try {
    const file = req.file;
    const ownerId = req.body.userId;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!ownerId) {
      return res.status(400).json({ message: "User is not logged in" });
    }

    const processFunction = file.mimetype !== "application/pdf" ? processImageFile : processPdfFile;
    try {
      let { document, text, classificationResult } = await processFunction(file, ownerId, res);

      if (classificationResult.length === 0) {
        return res.status(500).json({ message: "Failed to classify document" });
      }
      const newDocument = await documentRepository.save(document);
      await index.addDocuments([{ id: newDocument.id, title: newDocument.document.originalname, text: text, ownerId, category: classificationResult }], { primaryKey: 'id' });

      // Add default permission for the owner
      const defaultPermission = new DocumentPermission();
      defaultPermission.documentId = newDocument.id;
      defaultPermission.userId = ownerId;
      defaultPermission.accessLevel = 'full'; // Full access for the owner

      await documentPermissionRepository.save(defaultPermission);

      // Add document to MeiliSearch index
      await index.addDocuments([{ id: newDocument.id, title: newDocument.document.originalname, text: text, ownerId, category: classificationResult }], { primaryKey: 'id' });

      res.status(201).json({ document: newDocument });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to save document" });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to process document" });
  }
});

DocumentsRouter.patch("/category/:id", checkPermission("edit"), async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);
    const category = req.body.category;
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.category = category;
    const updatedDocument = await documentRepository.save(document);
    index.updateDocuments([{ id: updatedDocument.id, category: category }], {
      primaryKey: "id",
    });

    res.status(200).json({ document: updatedDocument });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.patch("/lastOpened/:id", checkPermission("read"), async (req: Request, res: Response) => {

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

DocumentsRouter.delete("/:id", checkPermission("full"), async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);

    // Find document by id
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    const filePath = path.join(
      __dirname,
      "../uploads",
      document.document.filename
    );

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



DocumentsRouter.patch("/starred/:id/file", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);
    const starred = req.body.starred;
    const document = await documentRepository.findOne({ where: { id: id } });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.starred = starred;
    const updatedDocument = await documentRepository.save(document);

    res.status(200).json({ document: updatedDocument });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

