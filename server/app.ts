import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { port } from "./config/config";
import { dataSource } from "./db/database";
import { User } from "./models/user";
import { UsersRouter } from "./routers/users-router";
import { DocumentsRouter } from "./routers/documents-router";
import MeiliSearch from "meilisearch";

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
    app.use("/api/users", UsersRouter);
    app.use("/api/documents", DocumentsRouter);

    // Start the server
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
})
  
  .catch((error: any) => {
    console.error("Error connecting to the database:", error);
  });
