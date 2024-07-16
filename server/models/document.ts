import { Entity, UpdateDateColumn } from "typeorm";
import { PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

interface DocumentAttributes {
  id: number;
  document: {
    mimetype: string;
    path: string;
    textExracted: string;
  };
  uploadedAt: Date;
  lastOpened: Date;
  views: number;
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
  
  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  lastOpened: Date;

  @Column({default: 0})
  views: number;
}
