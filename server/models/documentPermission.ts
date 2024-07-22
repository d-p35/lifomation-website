import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Column, Unique  } from "typeorm";
import { User } from "./user";
import { Document } from "./document";

interface DocumentPermissionAttributes {
  id: number;
  documentId: number;
  userId: string;
  accessLevel: "read" | "edit" | "full";
}

@Entity()
@Unique(["documentId", "userId"])
export class DocumentPermission implements DocumentPermissionAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  documentId: number;

  @Column()
  userId: string;

  @Column()
  accessLevel: "read" | "edit" | "full";

  @ManyToOne(() => Document, (document) => document.permissions)
  @JoinColumn({ name: "documentId" })
  document: Document;

  @ManyToOne(() => User, (user) => user.permissions)
  @JoinColumn({ name: "userId" })
  user: User;
}