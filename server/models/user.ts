import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Document } from "./document";
import { DocumentPermission } from "./documentPermission";

interface UserAttributes {
  id: string;
  documents: Document[];
  permissions: DocumentPermission[];
}

@Entity()
export class User implements UserAttributes {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => Document, (document) => document.owner)
  documents: Document[];

  @OneToMany(() => DocumentPermission, (permission) => permission.user)
  permissions: DocumentPermission[];
}
