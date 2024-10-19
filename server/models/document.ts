import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { AllowNull } from "sequelize-typescript";
import { Category } from "../types/categories";

interface DocumentAttributes{
  id: number;
  document: Express.Multer.File;
  uploadedAt: Date;
  owner: User;
  ownerId: string;
  category: Category;
  keyInfo: Record<string, any>;
}

@Entity()
export class Document implements DocumentAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("json")
  document: Express.Multer.File;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column()
  categoryName: string;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: "categoryName" })
  category: Category;

  @Column("json", { nullable: true })
  keyInfo: Record<string, any>;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: "ownerId" })
  owner: User;


}
