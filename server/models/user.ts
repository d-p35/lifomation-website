import { Column, Entity, OneToMany, OneToOne, PrimaryColumn, Unique } from "typeorm";
import { GovernmentUtils } from "./governmentutils";
import { Document } from "./document";
import { Health } from "./health";

interface UserAttributes {
  id: string;
  documents: Document[];
  email: string;
  governmentUtils: GovernmentUtils;
  health: Health
}

@Entity()
// @Unique("email", ["email"])
export class User implements UserAttributes {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => GovernmentUtils, (governmentUtils) => governmentUtils.owner)
  governmentUtils: GovernmentUtils

  @OneToMany(() => Document, (document) => document.owner)
  documents: Document[];

  @OneToOne(() => Health, (health) => health.owner)
  health: Health
}
