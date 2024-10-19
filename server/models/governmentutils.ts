import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { AllowNull } from "sequelize-typescript";
import { Document } from "./document";
import { Category } from "../types/categories";

export interface GovernmentUtilsAttributes extends Category{
  ownerId: string;
  folderKeyInfo: Record<string, any>;
  documents: Document[];
  owner: User;
}

@Entity()
export class GovernmentUtils implements GovernmentUtilsAttributes {
  @PrimaryColumn()
  name: string;

  @Column("json", { nullable: true })
  folderKeyInfo: Record<string, any>;

  @Column()
  ownerId: string;

  @OneToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @OneToMany(() => Document, (document) => document.category)
  documents: Document[];

}
