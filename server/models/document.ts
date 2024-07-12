import { Entity } from "typeorm";
import { PrimaryGeneratedColumn, Column } from "typeorm";

interface DocumentAttributes {
  id: number;
  document: {
    mimetype: string;
    path: string;
    textExracted: string;
  };
}

@Entity()
export class Document implements DocumentAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("json")
  document: {
    mimetype: string;
    path: string;
    textExracted: string;
  };
}
