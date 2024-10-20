import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { AllowNull } from "sequelize-typescript";
import { Document } from "./document";
import { Category } from "../types/categories";
import { CategoryDBType, GovernmentUtilsAttributes } from "./governmentutils";



@Entity()
export class Health extends CategoryDBType implements GovernmentUtilsAttributes {
  @PrimaryColumn()
  name: string;

  @Column("json", { nullable: true })
  folderKeyInfo: Record<string, any>;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  // @OneToMany(() => Document, (document) => document.category)
  // documents: Document[];

}
