import { Entity } from 'typeorm';
import { PrimaryGeneratedColumn, Column } from 'typeorm';


interface UserAttributes {
    id: number;
    username: string;}

@Entity()
export class User implements UserAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;
}


