import * as dotenv from "dotenv";
import path from "path";

const envPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "../../.env") : path.resolve(__dirname, "../.env");
dotenv.config({
  path: envPath,
});
console.log(process.env.NODE_ENV);
export const port = Number(process.env.API_PORT);
export const db_host = String(process.env.DB_HOST);
export const db_port = Number(process.env.DB_PORT);
export const db_name = String(process.env.DB_NAME);
export const db_user = String(process.env.DB_USER);
export const db_password = String(process.env.DB_PASSWORD);
