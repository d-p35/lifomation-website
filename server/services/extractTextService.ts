import axios from "axios";
import fs from "fs";
import path from "path";
import tesseract from "tesseract.js";
import { v4 as uuidv4 } from "uuid";
import extract from "extract-zip";
import { Response } from "express";
import { Document } from "../models/document";
import MeiliSearch from "meilisearch";

import { classifyText } from "./watsonTextClassificationService";
import { geminiTextClassification } from "./geminiTextClassificationService";
const client = new MeiliSearch({ host: "http://localhost:7700" });
const index = client.index("documents");

export async function processImageFile(
  file: Express.Multer.File,
  ownerId: string
) {
  const filePath = file.path;
  const {
    data: { text: OCRtext },
  } = await tesseract.recognize(filePath, "eng");

  //   const classificationResult = await classifyText(OCRtext);
  const { categories, keyInfo } = await geminiTextClassification(OCRtext);

  const document = new Document();
  document.document = file;
  document.ownerId = ownerId;
  document.keyInfo = keyInfo;
  document.category = categories
    .split(",")
    .map((category: string) => category.trim())
    .join(",");

  // const doc = await client.getIndexes({ limit: 3 })
  // console.log(doc);

  return { document, text: OCRtext, classificationResult: categories };
}

// Function to handle PDF file processing
export async function processPdfFile(
  file: Express.Multer.File,
  ownerId: string,
  res: Response
) {
  const uniqueFolderName = uuidv4();
  const documentFolder = path.join(__dirname, "../uploads", uniqueFolderName);
  const imagesFolder = path.join(documentFolder, "images");
  const metadataFilePath = path.join(documentFolder, "metadata.txt");
  const textdataFilePath = path.join(documentFolder, "text.txt");

  await createDirectories([documentFolder, imagesFolder]);

  const fileHandle = await fs.promises.open(file.path, "r");
  const parsingData = fileHandle.createReadStream();

  const tikaResponse = await sendToTika(parsingData);

  if (tikaResponse.status === 200) {
    const combinedText = await handleTikaResponse(
      tikaResponse,
      documentFolder,
      imagesFolder,
      metadataFilePath,
      textdataFilePath
    );

    const document = new Document();
    document.document = file;
    document.ownerId = ownerId;

    // await index.addDocuments([{ id: document.id, text: combinedText, ownerId }]);
    const { categories, keyInfo } = await geminiTextClassification(
      combinedText
    );
    document.keyInfo = keyInfo;
    document.category = categories
      .split(",")
      .map((category: string) => category.trim())
      .join(",");

    return { document, text: combinedText, classificationResult: categories };
  } else {
    throw new Error("Error processing document with Tika");
  }
}

// Function to create directories
async function createDirectories(paths: string[]) {
  for (const dir of paths) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

// Function to send data to Tika server
async function sendToTika(parsingData: fs.ReadStream) {
  return await axios({
    method: "PUT",
    url: "http://localhost:9998/unpack/all",
    data: parsingData,
    responseType: "stream",
    headers: {
      "X-Tika-PDFExtractInlineImages": "true",
      "X-Tika-PDFExtractUniqueInlineImagesOnly": "true",
      "Content-Type": "application/octet-stream",
    },
  });
}

// Function to handle Tika response
async function handleTikaResponse(
  tikaResponse: any,
  documentFolder: string,
  imagesFolder: string,
  metadataFilePath: string,
  textdataFilePath: string
): Promise<string> {
  const tempDir = path.join(documentFolder, "temp");
  await createDirectories([tempDir]);

  const combinedText = await new Promise<string>(async (resolve, reject) => {
    tikaResponse.data
      .pipe(fs.createWriteStream(path.join(tempDir, "tika-output.zip")))
      .on("finish", async () => {
        await extract(path.join(tempDir, "tika-output.zip"), { dir: tempDir });

        const files = await fs.promises.readdir(tempDir);
        let extractedText = "";
        let metadataText = "";
        let OCRText = "";

        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stat = await fs.promises.stat(filePath);

          if (stat.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (file === "__METADATA__") {
              metadataText += await fs.promises.readFile(filePath, "utf-8");
            } else if (file === "__TEXT__") {
              extractedText += await fs.promises.readFile(filePath, "utf-8");
            } else if ([".jpg", ".png", ".jpeg"].includes(ext)) {
              const newImagePath = path.join(imagesFolder, file);
              await fs.promises.rename(filePath, newImagePath);
              OCRText += (await tesseract.recognize(newImagePath, "eng")).data
                .text;
            }
          }
        }

        await fs.promises.writeFile(metadataFilePath, metadataText);
        await fs.promises.writeFile(textdataFilePath, extractedText);
        const combinedText = extractedText + OCRText;
        // const classificationResult = await classifyText(combinedText);

        resolve(combinedText);
      })
      .on("error", (err: Error) => {
        reject(err);
      });
  });

  return combinedText;
}
