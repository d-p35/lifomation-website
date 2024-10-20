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
import { GovernmentUtils } from "../models/governmentutils";
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
import { Health } from "../models/health";

require("dotenv").config();

export const HealthRouter = Router();
const upload = multer({ dest: "uploads/" });
const client = new MeiliSearch({
  host:
    process.env.NODE_ENV == "production"
      ? "https://meilisearch.lifomation.tech"
      : "http://localhost:7700",
});

const HealthRepository: Repository<Health> =
  dataSource.getRepository(Health);


HealthRouter.get("/", async (req: Request, res: Response) => {
  const userId = req.auth?.payload.sub;

  if (!userId) {
    return res.status(401).json({ message: "User not logged In" });
  }

  const govtUtils  = await HealthRepository.findOne({where:{ ownerId: userId }});

  if (!govtUtils) {
    return res.status(500).json({ message: "Folder info not found" });
  }
  res.status(200).json({folderInfo: govtUtils.folderKeyInfo});
})


HealthRouter.patch("/add", async (req: Request, res: Response) => {

  const userId = req.auth?.payload.sub;
  const { key, value } = req.body;

  console.log( req.body)

  if (!userId) {
    return res.status(401).json({ message: "User not logged In" });
  }

  if (!key || !value) {
    return res.status(400).json({ message: "Key and value are required" });
  }

  const govtUtils  = await HealthRepository.findOne({where:{ ownerId: userId }});

  if (!govtUtils) {
    return res.status(500).json({ message: "Folder info not found" });
  }

  if (govtUtils.folderKeyInfo[key]) {
    return res.status(400).json({ message: "Key already exists" });
  }

  govtUtils.folderKeyInfo[key] = value;
  const updatedDocument = await HealthRepository.save(govtUtils);

  res.status(200);

})


