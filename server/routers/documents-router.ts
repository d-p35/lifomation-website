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
import { getEmailFromUserId, getUserIdFromEmail } from "../utils/userUtils"; // Import the utility function
import { WebSocketServer } from "ws";
import { notifyUser } from "../services/websocket";

require("dotenv").config();

const upload = multer({ dest: "uploads/" });
const client = new MeiliSearch({host: process.env.NODE_ENV=='production'?'https://meilisearch.lifomation.tech':"http://localhost:7700" });
const index = client.index("documents");
export const DocumentsRouter = Router();
const documentRepository: Repository<Document> =
  dataSource.getRepository(Document);
// const documentPermissionRepository: Repository<DocumentPermission> =
//   dataSource.getRepository(DocumentPermission);
const UserRepository: Repository<User> = dataSource.getRepository(User);

// Middleware to check permissions
// const checkPermission = (requiredAccessLevel: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {


//     const documentId = parseInt(req.params.id);
//     const userId = req.auth?.payload.sub;
//     if (!userId) {
//       return res.status(401).json({ message: "User not logged In" });
//     }


//     const document = await documentRepository.findOne({
//       where: { id: documentId },
//       relations: ["permissions"],
//     });



//     if (!document) {
//       return res.status(404).json({ message: "Document not found" });
//     }

//     const permission = document.permissions.find((p) => p.user.id === userId);


//     const accessLevels = ["read", "edit", "full"];
//     const userAccessLevelIndex = accessLevels.indexOf(
//       permission?.accessLevel || "none"
//     );
//     const requiredAccessLevelIndex = accessLevels.indexOf(requiredAccessLevel);


//     if (userAccessLevelIndex < requiredAccessLevelIndex) {
//       return res.status(403).json({ message: "Permission denied" });
//     }

//     next();
//   };
// };



// export const editDocument = (wss: WebSocketServer) => {
  DocumentsRouter.delete("/:id/delkey-info", async (req: Request, res: Response) => {
    try {

      const documentId: number = parseInt(req.params.id);
      const key = req.body.key;
      const ownerId = req.auth?.payload.sub;

      if (!ownerId) {
        return res.status(401).json({ message: "User not logged In" });
      }
  
      const document = await documentRepository.findOne({ where: { id: documentId, ownerId: ownerId} });
  
      if (!document) {
        return res.status(404).json({ error: 'Document not found or you don\'t own it' });
      }

  
      if (document.keyInfo && document.keyInfo[key]) {
        delete document.keyInfo[key];
        const updatedDocument = await documentRepository.save(document);

        
  
        res.status(200).json({ document: updatedDocument });
      } else {
        res.status(404).json({ error: 'Key not found' });
      }
    } catch (error) {
      console.error('Error deleting key info:', error);
      res.status(500).json({ error: 'Failed to delete key info' });
    }
  });

  DocumentsRouter.put("/:id/key-info", async (req: Request, res: Response) => {
    try {
      const documentId: number = parseInt(req.params.id);
      const key = req.body.key;
      const newValue = req.body.newValue;
      const ownerId = req.auth?.payload.sub;

      if (!ownerId) {
        return res.status(401).json({ message: "User not logged In" });
      }

      const originalKey = req.body.editkey;

      const document = await documentRepository.findOne({
        where: { id: documentId, ownerId: ownerId },
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (key!=originalKey) {
        delete document.keyInfo[originalKey];
      }
      document.keyInfo[key] = newValue;

      const updatedDocument = await documentRepository.save(document);
      

      res.status(200).json({ document: updatedDocument });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  DocumentsRouter.post("/:id/addkey-info", async (req: Request, res: Response) => {
    try {
      const documentId: number = parseInt(req.params.id);
      const key = req.body.key;
      const value = req.body.value;
      const ownerId = req.auth?.payload.sub;

      if (!ownerId) {
        return res.status(401).json({ message: "User not logged In" });
      }

      const document = await documentRepository.findOne({
        where: { id: documentId, ownerId: ownerId },
      });

      if (!document) {
        return res.status(404).json({ message: "Document not found or you don't own it" });
      }

      if (document.keyInfo[key]) {
        return res.status(400).json({ message: "Key already exists" });
      }

      document.keyInfo[key] = value;
      const updatedDocument = await documentRepository.save(document);

      // const editorEmail = await getEmailFromUserId(userId);

      // if (!editorEmail) {
      //   return res.status(404).json({ message: "Editor not found" });
      // }


      // const getAllSharedUsers= await documentPermissionRepository.find({where: {documentId: documentId}})

      
      // let getemails = getAllSharedUsers.map((user) => user.email)
      // const getUserIds = await UserRepository.find({where: {email: In(getemails)}})
      // for (let i = 0; i < getUserIds.length; i++) {
      //   const sharedUserId = getUserIds[i].id;
      //   if(userId===sharedUserId)continue;
      //   if (!sharedUserId) {
      //     return res.status(404).json({ message: "User not found" });
      //   }
      //   notifyUser(sharedUserId as string, {
      //     type: "add",
      //     document: updatedDocument,
      //     key,
      //     value: value,
      //     senderEmail: editorEmail,
      //   });
      // }

      res.status(200).json({ document: updatedDocument });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

// }

//------------------------------------------------------------------------------------------------
//-------------------------SharedComponent-------------------------------------------------------
//------------------------------------------------------------------------------------------------

// Add a permission to a document



// Get permissions for a document

// Remove a permission from a document

// DocumentsRouter.get("/shared", async (req: Request, res: Response) => {
//   try {
//     const userId = req.query.userId as string;
//     const cursor = req.query.cursor as string;
//     const rows = parseInt(req.query.rows as string) || 10;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     let email = await getEmailFromUserId(userId);


//     let whereClause = { email: email } as any;

//     if (cursor) {
//       let cursorDate = new Date(cursor);
//       whereClause.lastOpened = LessThan(cursorDate);
//     }

//     // Step 1: Find all document permissions for the user
//     const permissions = await documentPermissionRepository.find({
//       take: rows,
//       where: { ...whereClause, document: { email: Not(email) } },
//       order: { lastOpened: "DESC" },
//       relations: { document: true },
//     });

//     let nextCursor: string | null = null;
//     if (permissions.length == rows) {
//       const lastDocument = permissions[rows - 1];
//       nextCursor = lastDocument.lastOpened.toISOString();
//     }

//     const documents = permissions.map((permission) => {
//       return {
//         ...permission.document,
//         lastOpened: permission.lastOpened,
//         starred: permission.starred,
//       };
//     });

//     res.json({ nextCursor, documents: documents });
//   } catch (error) {
//     console.error("Error fetching shared documents:", error);
//     res.status(500).send("Internal server error");
//   }
// });

//------------------------------------------------------------------------------------------------
//---------------------------------Document-------------------------------------------------------
//------------------------------------------------------------------------------------------------

// Your existing router code
DocumentsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const rows = parseInt(req.query.rows as string) || 10;
    const ownerId = req.auth?.payload.sub;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let cursor = req.query.cursor as string; // This will be in the format "timestamp_id"

    let whereClause = {} as any;
    const categoryName = req.query.categoryName as string;

    if (categoryName) {
      whereClause.categoryName = categoryName ;
    }
    if (cursor) {
      let cursorDate = new Date(cursor);
      whereClause.uploadedAt = LessThan(cursorDate);
    }



    const documents = await documentRepository.find({
      take: rows, // Fetch one extra row to check if there are more documents
      order: { uploadedAt: "DESC" },
      where: { ...whereClause, owner: { id: ownerId } },
    });


    let nextCursor: string | null = null;
    if (documents.length == rows) {
      const lastDocument = documents[rows - 1];
      nextCursor = lastDocument.uploadedAt.toISOString();
    }

    const results = documents.map((doc) => {
      return {
        ...doc,
      };
    });

    res.status(200).json({ nextCursor, documents: results });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DocumentsRouter.get("/star", async (req: Request, res: Response) => {
//   try {
//     const ownerId = req.auth?.payload.sub;
//     if (!ownerId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const cursor = req.query.cursor as string;
//     const rows = parseInt(req.query.rows as string) || 10;
//     let email = await getEmailFromUserId(ownerId as string);

//     let whereClause = { email, starred: true } as any;

//     if (cursor) {
//       let cursorDate = new Date(cursor);
//       whereClause.lastOpened = LessThan(cursorDate);
//     }

//     const documents = await documentPermissionRepository.find({
//       take: rows,
//       relations: {
//         document: true,
//       },
//       order: { lastOpened: "DESC" },
//       where: whereClause,
//     });

//     let nextCursor: string | null = null;
//     if (documents.length == rows) {
//       const lastDocument = documents[rows - 1];
//       nextCursor = lastDocument.lastOpened.toISOString();
//     }


//     const result = documents.map((doc) => {
//       return {
//         ...doc.document,
//         starred: doc.starred,
//         lastOpened: doc.lastOpened,
//       };
//     });

//     res.status(200).json({ nextCursor, documents: result });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// });

DocumentsRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const userId = req.auth?.payload.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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


//     const result = documents.map((doc) => {
//       return {
//         ...doc.document,
//         starred: doc.starred,
//         lastOpened: doc.lastOpened,
//       };
//     });

//     res.status(200).json({ nextCursor, documents: result });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// });

DocumentsRouter.get(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const document = await documentRepository.findOne({ where: { id: id, owner: { id: req.auth?.payload.sub } },relations:{owner: true} });

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
  async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const document = await documentRepository.findOne({ where: { id: id } });

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }


      if (document.ownerId !== req.auth?.payload.sub) {
        return res.status(401).json({ message: "Unauthorized" });
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
      const ownerId = req.auth?.payload.sub;
      // const category = req.body.category; 

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      if (!ownerId) {
        return res.status(400).json({ message: "User is not logged in" });
      }

      // if (!category) {
      //   return res.status(400).json({ message: "Category is required" });
      // }



      const processFunction =
        file.mimetype !== "application/pdf" ? processImageFile : processPdfFile;
      try {
        let { document, text, classificationResult } = await processFunction(
          file,
          ownerId,
          res
        );

        console.log(classificationResult);

        // let document = new Document();
        // document.category = category
        // document.document = file;
        //  document.keyInfo = {};
       
        document.document = file;
        document.ownerId = ownerId;

        // if (classificationResult.length === 0) {
        //   return res
        //     .status(500)
        //     .json({ message: "Failed to classify document" });
        // }

        document.categoryName = classificationResult
        const newDocument = await documentRepository.save(document);



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
  async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const category = req.body.category;
      const ownerId = req.auth?.payload.sub;

      if (!ownerId) {
        return res.status(401).json({ message: "Unauthorized" });
      }


      const document = await documentRepository.findOne({ where: { id: id, ownerId: ownerId } });

      if (!document) {
        return res.status(404).json({ message: "Document not found or not owned" });
      }

      document.categoryName = category;
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

// DocumentsRouter.patch(
//   "/lastOpened/:id",
//   async (req: Request, res: Response) => {
//     try {
//       // Update lastOpened
//       const id: number = parseInt(req.params.id);
//       const document = await documentRepository.findOne({
//         where: { documentId: id },
//         relations: { document: true },
//       });

//       if (!document) {
//         return res.status(404).json({ message: "Document not found" });
//       }
//       document.views = document.views + 1;
//       await documentPermissionRepository.save(document);

//       // Return the new document
//       res.status(200).json({ document });
//     } catch (err: any) {
//       res.status(500).json({ message: err.message });
//     }
//   }
// );

DocumentsRouter.delete(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const ownerId = req.auth?.payload.sub;

      if (!ownerId) {
        return res.status(401).json({ message: "Unauthorized" });
      } 

      const document = await documentRepository.findOne({ where: { id: id, ownerId: ownerId } });

      if (!document) {
        return res.status(404).json({ message: "Document not found or you don't own it" });
      }


      index.deleteDocument(document.id);
      // Delete document
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

// DocumentsRouter.patch(
//   "/starred/:id/file",
//   async (req: Request, res: Response) => {
//     try {
//       const id: number = parseInt(req.params.id);
//       const userId = req.body.userId;
//       const starred = req.body.starred;

//       const userEmail = await getEmailFromUserId(userId);
//       if (!userEmail) {
//         return res.status(404).json({ message: "User not found" });
//       }



//       if (!document) {
//         return res.status(404).json({ message: "Document not found" });
//       }


//       res.status(200).json({ document: updatedDocument });
//     } catch (err: any) {
//       res.status(500).json({ message: err.message });
//     }
//   }
// );
