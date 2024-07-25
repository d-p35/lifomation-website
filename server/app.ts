import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { port } from "./config/config";
import { dataSource } from "./db/database";
import { UsersRouter } from "./routers/users-router";
import { DocumentsRouter } from "./routers/documents-router";
import MeiliSearch from "meilisearch";
import synonyms from "./synonyms.json";
import { WebSocketServer } from "ws"; // Import WebSocketServer

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

    const client = new MeiliSearch({ host: "http://localhost:7700" });
    const index = client.index("documents");

    index.updateFilterableAttributes(["ownerId"]).then(() => {
      console.log("Filterable attributes updated.");
      index.updateSynonyms(synonyms).then(() => {
        console.log("Synonyms updated.");
        index.updateSearchableAttributes(["title", "text", "category"]).then(() => {
          app.use("/api/users", UsersRouter);
          app.use("/api/documents", DocumentsRouter);

          const server = app.listen(port, () => {
            console.log(`Server started on port ${port}`);
          });

          // WebSocket setup
          const wss = new WebSocketServer({ server });

          wss.on("connection", (ws) => {
            console.log("Client connected");

            ws.on("message", (message) => {
              console.log(`Received message => ${message}`);

              // Broadcast message to all clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                  client.send(message);
                }
              });
            });

            ws.on("close", () => {
              console.log("Client disconnected");
            });
          });
        });
      });
    });
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error);
  });
