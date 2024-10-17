import { Column, Entity, OneToMany, PrimaryColumn, Unique } from "typeorm";
import { Document } from "./document";

interface UserAttributes {
  id: string;
  documents: Document[];
  email: string;
}

@Entity()
export class User implements UserAttributes {
  @PrimaryColumn()
  id: string;

  @Column()
  // @Unique()
  email: string;

  @OneToMany(() => Document, (document) => document.owner)
  documents: Document[];

}
