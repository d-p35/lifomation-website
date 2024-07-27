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
const app = express();

app.use(express.json());
const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dataSource
  .initialize()
  .then(() => {
    console.log("Database connection established.");

    const client = new MeiliSearch({ host: "http://meilisearch:7700" });
    const index = client.index("documents");

    index.updateFilterableAttributes(["ownerId", "sharedUsers"]).then(() => {
      console.log("Filterable attributes updated.");
      index.updateSynonyms(synonyms).then(() => {
        console.log("Synonyms updated.");
        index
          .updateSearchableAttributes(["title", "text", "category"])
          .then(() => {
            app.use("/api/users", UsersRouter);
            app.use("/api/documents", DocumentsRouter);

            const server = app.listen(port, () => {
              console.log(`Server started on port ${port}`);
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
