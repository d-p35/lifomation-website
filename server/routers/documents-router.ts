import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import {
  Repository,
  Like,
  MoreThanOrEqual,
  LessThanOrEqual,
  LessThan,
  In,
  Not,
} from "typeorm";
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
import { getEmailFromUserId, getUserIdFromEmail } from "../utils/userUtils"; // Import the utility function
import { WebSocketServer } from "ws";
import { notifyUser } from "../services/websocket";

require("dotenv").config();

const upload = multer({ dest: "uploads/" });
const client = new MeiliSearch({host: process.env.NODE_ENV=='production'?'https://meilisearch.lifomation.tech':"http://meilisearch:7700" });
const index = client.index("documents");
export const DocumentsRouter = Router();
const documentRepository: Repository<Document> =
  dataSource.getRepository(Document);
const documentPermissionRepository: Repository<DocumentPermission> =
  dataSource.getRepository(DocumentPermission);
const UserRepository: Repository<User> = dataSource.getRepository(User);

// Middleware to check permissions
const checkPermission = (requiredAccessLevel: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware executed");

    const documentId = parseInt(req.params.id);
    let email = req.body.email || req.query.email || req.headers["email"];
    const userId = req.body.userId || req.query.userId || req.headers["userId"];
    console.log(`Email: ${email}, User ID: ${userId}`);

    if (!email && userId) {
      email = await getEmailFromUserId(userId);
    }
    console.log(`Email: ${email}, User ID: ${userId}`);
    if (!email) {
      return res.status(400).json({ message: "Email or User ID is required" });
    }
    console.log(`Email: ${email}, User ID: ${userId}`);

    const document = await documentRepository.findOne({
      where: { id: documentId },
      relations: ["permissions"],
    });

    // console.log(`Document: ${JSON.stringify(document)}`);

    if (!document) {
      console.log("Document not found");
      return res.status(404).json({ message: "Document not found" });
    }

    const permission = document.permissions.find((p) => p.email === email);
    console.log(`Found permission: ${JSON.stringify(permission)}`);

    const accessLevels = ["read", "edit", "full"];
    const userAccessLevelIndex = accessLevels.indexOf(
      permission?.accessLevel || "none"
    );
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

export const editDocument = (wss: WebSocketServer) => {
  DocumentsRouter.put("/:id/key-info", async (req: Request, res: Response) => {
    try {
      const documentId: number = parseInt(req.params.id);
      const key = req.body.key;
      const newValue = req.body.newValue;
      const userId = req.body.userId;
      console.log(
        `Updating key ${key} to ${newValue} for document ${documentId}`
      );
      const document = await documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      document.keyInfo[key] = newValue;
      const updatedDocument = await documentRepository.save(document);

      const editorId = await getEmailFromUserId(userId);

      if (!editorId) {
        return res.status(404).json({ message: "Editor not found" });
      }

      notifyUser(document.ownerId, {
        type: "edit",
        documentId,
        documentTitle: document.document.originalname,
        key,
        value: newValue,
        senderEmail: editorId,
      });

      res.status(200).json({ document: updatedDocument });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
};

//------------------------------------------------------------------------------------------------
//-------------------------SharedComponent-------------------------------------------------------
//------------------------------------------------------------------------------------------------

// Add a permission to a document

export const shareDocument = (wss: WebSocketServer) => {
  DocumentsRouter.post("/:id/share", async (req: Request, res: Response) => {
    try {
      const documentId: number = parseInt(req.params.id);
      const { email, accessLevel } = req.body;

      // Validate request body
      if (!email || !accessLevel) {
        return res
          .status(400)
          .json({ message: "userId and accessLevel are required" });
      }

      const document = await documentRepository.findOne({
        where: { id: documentId },
      });
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      // Check if a DocumentPermission already exists for this documentId and userId
      let existingPermission = await documentPermissionRepository.findOne({
        where: { documentId, email },
      });

      const userId = await getUserIdFromEmail(email);

      if (!userId) {
        return res.status(404).json({ message: "User not found" });
      }

      index.getDocument(documentId).then((document) => {
        if (!document) {
          return res
            .status(404)
            .json({ message: "Document not found in MeiliSearch" });
        }
        let sharedUsers = document.sharedUsers || [];
        //add is not already in it
        if (!sharedUsers.includes(userId)) {
          sharedUsers.push(userId);
        }
        index.updateDocuments(
          [{ id: documentId, sharedUsers: [...sharedUsers] }],
          { primaryKey: "id" }
        );
      });

      if (existingPermission) {
        // Update the existing permission
        existingPermission.accessLevel = accessLevel;
        await documentPermissionRepository.save(existingPermission);
        return res.status(200).json({ message: "Permission updated" });
      } else {
        // Create a new permission

        const recieverId = await getUserIdFromEmail(email);

        if (!recieverId) {
          return res.status(404).json({ message: "User not found" });
        }

        notifyUser(recieverId as string, {
          type: "share",
          documentId,
          accessLevel,
          senderEmail: email,
        });

        const newPermission = new DocumentPermission();
        newPermission.documentId = documentId;
        newPermission.email = email;
        newPermission.accessLevel = accessLevel;
        await documentPermissionRepository.save(newPermission);
        return res.status(201).json({ message: "Permission added" });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
};

// Get permissions for a document
DocumentsRouter.get("/:id/permissions", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const documentId: number = parseInt(req.params.id);

    const email = await getEmailFromUserId(userId);

    if (!email) {
      return res.status(404).json({ message: "User not found" });
    }

    const permissions = await documentPermissionRepository.findOne({
      where: { documentId: documentId, email: email },
    });

    res.status(200).json({ permissions });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a permission from a document
DocumentsRouter.delete("/:id/share", async (req: Request, res: Response) => {
  try {
    const documentId: number = parseInt(req.params.id);
    const { email } = req.body;

    await documentPermissionRepository.delete({
      documentId: documentId,
      email: email,
    });

    index.getDocument(documentId).then((document) => {
      if (!document) {
        return res
          .status(404)
          .json({ message: "Document not found in MeiliSearch" });
      }
      let sharedUsers = document.sharedUsers || [];
      sharedUsers = sharedUsers.filter((user: string) => user !== email);
      index.updateDocuments(
        [{ id: documentId, sharedUsers: [...sharedUsers] }],
        { primaryKey: "id" }
      );
    });

    res.status(204).json();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.get("/shared", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const cursor = req.query.cursor as string;
    const rows = parseInt(req.query.rows as string) || 10;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let email = await getEmailFromUserId(userId);
    console.log(`Email: ${email}`);

    let whereClause = { email: email } as any;

    if (cursor) {
      let cursorDate = new Date(cursor);
      whereClause.lastOpened = LessThan(cursorDate);
    }

    // Step 1: Find all document permissions for the user
    const permissions = await documentPermissionRepository.find({
      take: rows,
      where: { ...whereClause, document: { email: Not(email) } },
      order: { lastOpened: "DESC" },
      relations: { document: true },
    });

    let nextCursor: string | null = null;
    if (permissions.length == rows) {
      const lastDocument = permissions[rows - 1];
      nextCursor = lastDocument.lastOpened.toISOString();
    }

    const documents = permissions.map((permission) => {
      return {
        ...permission.document,
        lastOpened: permission.lastOpened,
        starred: permission.starred,
      };
    });

    res.json({ nextCursor, documents: documents });
  } catch (error) {
    console.error("Error fetching shared documents:", error);
    res.status(500).send("Internal server error");
  }
});

//------------------------------------------------------------------------------------------------
//---------------------------------Document-------------------------------------------------------
//------------------------------------------------------------------------------------------------

// Your existing router code
DocumentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const rows = parseInt(req.query.rows as string) || 10;
    const ownerId = req.query.userId as string;
    const categoryName = req.query.categoryName as string;
    let cursor = req.query.cursor as string; // This will be in the format "timestamp_id"
    let email = await getEmailFromUserId(ownerId as string);

    let whereClause = { email: email } as any;
    if (categoryName) {
      whereClause.category = Like(`${categoryName},%`);
    }

    if (cursor) {
      let cursorDate = new Date(cursor);
      whereClause.uploadedAt = LessThan(cursorDate);
    }

    const documents = await documentRepository.find({
      take: rows, // Fetch one extra row to check if there are more documents
      order: { uploadedAt: "DESC" },
      where: { ...whereClause, permissions: { email: email } },
      relations: {
        permissions: true,
      },
    });

    let nextCursor: string | null = null;
    if (documents.length == rows) {
      const lastDocument = documents[rows - 1];
      nextCursor = lastDocument.uploadedAt.toISOString();
    }

    const results = documents.map((doc) => {
      return {
        ...doc,
        lastOpened: doc.permissions[0].lastOpened,
        starred: doc.permissions[0].starred,
      };
    });

    res.status(200).json({ nextCursor, documents: results });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.get("/star", async (req: Request, res: Response) => {
  try {
    const ownerId = req.query.userId;
    const cursor = req.query.cursor as string;
    const rows = parseInt(req.query.rows as string) || 10;
    let email = await getEmailFromUserId(ownerId as string);

    let whereClause = { email, starred: true } as any;

    if (cursor) {
      let cursorDate = new Date(cursor);
      whereClause.lastOpened = LessThan(cursorDate);
    }

    const documents = await documentPermissionRepository.find({
      take: rows,
      relations: {
        document: true,
      },
      order: { lastOpened: "DESC" },
      where: whereClause,
    });

    let nextCursor: string | null = null;
    if (documents.length == rows) {
      const lastDocument = documents[rows - 1];
      nextCursor = lastDocument.lastOpened.toISOString();
    }
    console.log(email);
    console.log(documents);

    const result = documents.map((doc) => {
      return {
        ...doc.document,
        starred: doc.starred,
        lastOpened: doc.lastOpened,
      };
    });

    res.status(200).json({ nextCursor, documents: result });
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

    const searchResults = await index.search(query, {
      filter: `ownerId = "${userId}" OR sharedUsers IN ["${userId}"]`,
    });

    res.status(200).json(searchResults.hits);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

DocumentsRouter.get("/recent", async (req: Request, res: Response) => {
  try {
    const ownerId = req.query.userId;
    const cursor = req.query.cursor as string;
    const rows = parseInt(req.query.rows as string) || 10;

    let email = await getEmailFromUserId(ownerId as String);
    let whereClause = { email } as any;

    if (cursor) {
      let cursorDate = new Date(cursor);
      whereClause.lastOpened = LessThan(cursorDate);
    }

    let documents = await documentPermissionRepository.find({
      take: rows,
      relations: {
        document: true,
      },
      order: { lastOpened: "DESC" },
      where: whereClause,
    });

    let nextCursor: string | null = null;
    if (documents.length == rows) {
      const lastDocument = documents[rows - 1];
      nextCursor = lastDocument.lastOpened.toISOString();
    }

    const result = documents.map((doc) => {
      return {
        ...doc.document,
        starred: doc.starred,
        lastOpened: doc.lastOpened,
      };
    });

    res.status(200).json({ nextCursor, documents: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

DocumentsRouter.get(
  "/:id",
  checkPermission("read"),
  async (req: Request, res: Response) => {
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
  }
);

DocumentsRouter.get(
  "/:id/file",
  checkPermission("read"),
  async (req: Request, res: Response) => {
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
  }
);

DocumentsRouter.post(
  "/",
  upload.single("document"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const ownerId = req.body.userId;
      const email = req.body.email;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      if (!ownerId) {
        return res.status(400).json({ message: "User is not logged in" });
      }

      const processFunction =
        file.mimetype !== "application/pdf" ? processImageFile : processPdfFile;
      try {
        let { document, text, classificationResult } = await processFunction(
          file,
          ownerId,
          res
        );
        document.email = email;
        if (classificationResult.length === 0) {
          return res
            .status(500)
            .json({ message: "Failed to classify document" });
        }
        const newDocument = await documentRepository.save(document);
        await index.addDocuments(
          [
            {
              id: newDocument.id,
              title: newDocument.document.originalname,
              text: text,
              ownerId,
              category: classificationResult,
            },
          ],
          { primaryKey: "id" }
        );

        // Add default permission for the owner
        const defaultPermission = new DocumentPermission();
        defaultPermission.documentId = newDocument.id;
        defaultPermission.email = email;
        defaultPermission.accessLevel = "full"; // Full access for the owner

        const newDefaultPermission = await documentPermissionRepository.save(
          defaultPermission
        );

        // Add document to MeiliSearch index
        await index.addDocuments(
          [
            {
              id: newDocument.id,
              title: newDocument.document.originalname,
              text: text,
              ownerId,
              category: classificationResult,
              sharedUsers: [],
            },
          ],
          { primaryKey: "id" }
        );

        res.status(201).json({
          document: {
            ...newDocument,
            lastOpened: newDefaultPermission.lastOpened,
            starred: newDefaultPermission.starred,
          },
        });
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

DocumentsRouter.patch(
  "/category/:id",
  checkPermission("edit"),
  async (req: Request, res: Response) => {
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
  }
);

DocumentsRouter.patch(
  "/lastOpened/:id",
  checkPermission("read"),
  async (req: Request, res: Response) => {
    try {
      // Update lastOpened
      const id: number = parseInt(req.params.id);
      const document = await documentPermissionRepository.findOne({
        where: { documentId: id },
        relations: { document: true },
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      document.views = document.views + 1;
      await documentPermissionRepository.save(document);

      // Return the new document
      res.status(200).json({ document });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

DocumentsRouter.delete(
  "/:id",
  checkPermission("full"),
  async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);

      const document = await documentRepository.findOne({ where: { id: id } });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      index.deleteDocument(document.id);
      // Delete document
      await documentPermissionRepository.delete({ documentId: document.id });
      await documentRepository.delete(document.id);

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
  }
);

DocumentsRouter.patch(
  "/starred/:id/file",
  async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const userId = req.body.userId;
      const starred = req.body.starred;

      const userEmail = await getEmailFromUserId(userId);
      if (!userEmail) {
        return res.status(404).json({ message: "User not found" });
      }

      const document = await documentPermissionRepository.findOne({
        where: { documentId: id, email: userEmail },
        relations: { document: true },
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      document.starred = starred;
      const updatedDocument = await documentPermissionRepository.save(document);

      res.status(200).json({ document: updatedDocument });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);
