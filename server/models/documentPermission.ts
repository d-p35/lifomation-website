import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Column, Unique, UpdateDateColumn  } from "typeorm";
import { User } from "./user";
import { Document } from "./document";

interface DocumentPermissionAttributes {
  id: number;
  documentId: number;
  email: string;
  accessLevel: "read" | "edit" | "full";
  lastOpened: Date;
  views: number;
  starred: boolean;
}

@Entity()
@Unique(["documentId", "email"])
export class DocumentPermission implements DocumentPermissionAttributes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  documentId: number;

  @Column()
  email: string;

  @Column()
  accessLevel: "read" | "edit" | "full";

  @UpdateDateColumn()
  lastOpened: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ default: false })
  starred: boolean;

  @ManyToOne(() => Document, (document) => document.permissions)
  @JoinColumn({ name: "documentId" })
  document: Document;

  @ManyToOne(() => User, (user) => user.permissions)
  @JoinColumn({ name: "userId" })
  user: User;
}
