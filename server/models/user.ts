import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { PrimaryGeneratedColumn, Column } from "typeorm";
import { Document } from "./document";

interface UserAttributes {
  id: string;
  documents: Document[];
}

@Entity()
export class User implements UserAttributes {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => Document, (document) => document.owner)
  documents: Document[];
}
