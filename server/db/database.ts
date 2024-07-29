import {
  db_host,
  db_name,
  db_password,
  db_port,
  db_user,
} from "../config/config";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  database: db_name,
  password: db_password,
  host: db_host,
  port: db_port,
  username: db_user,
  type: "postgres",
  synchronize: true,
  logging: true,
  entities: [__dirname + "/../models/*.ts"],
});
