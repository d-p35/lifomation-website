import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { port } from "./config/config";
import { dataSource } from "./db/database";
import { UsersRouter } from "./routers/users-router";
import {
  DocumentsRouter,
  shareDocument,
  editDocument,
} from "./routers/documents-router";
import MeiliSearch from "meilisearch";
import synonyms from "./synonyms.json";
import { initWebSocketServer } from "./services/websocket";
import * as dotenv from "dotenv";
import path from "path";

// Specify the path to the .env file

const envPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../.env")
    : path.resolve(__dirname, "/.env");

dotenv.config({ path: envPath });

const app = express();

const PORT = process.env.PORT || 3000;

console.log(
  process.env.NODE_ENV == "production"
    ? "App running in production"
    : "App running locally"
);

app.use(express.json());
const corsOptions = {
  origin:
    process.env.NODE_ENV == "production"
      ? "https://lifomation.tech"
      : "http://localhost:4200",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dataSource
  .initialize()
  .then(() => {
    console.log(
      process.env.NODE_ENV == "production"
        ? "App running in production"
        : "App running locally"
    );

    const client = new MeiliSearch({
      host:
        process.env.NODE_ENV == "production"
          ? "https://meilisearch.lifomation.tech"
          : "http://localhost:7700",
    });
    const index = client.index("documents");

    index.updateFilterableAttributes(["ownerId", "sharedUsers"]).then(() => {
      index.updateSynonyms(synonyms).then(() => {
        index
          .updateSearchableAttributes(["title", "text", "category"])
          .then(() => {
            app.use("/api/users", UsersRouter);
            app.use("/api/documents", DocumentsRouter);

            const server = app.listen(PORT, () => {
              console.log(`Server started on port ${PORT}`);
            });

            // Initialize WebSocket server
            const wss = initWebSocketServer(server);
            shareDocument(wss);
            editDocument(wss);
          });
      });
    });
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error);
  });
