import { Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { User } from "./user";

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
  owner: User;
  ownerId: string;
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

  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  

}
