import { Repository } from "typeorm";
import { User } from "../models/user";
import { dataSource } from "../db/database";

const userRepository: Repository<User> = dataSource.getRepository(User);

export const getUserIdFromEmail = async (email: string): Promise<String | null> => {
  const user = await userRepository.findOne({ where: { email } });
  return user ? user.id : null;
};

export const getEmailFromUserId = async (userId:String): Promise<string | null> => {
    const user = await userRepository.findOne({ where: { id: String(userId) } });
    return user ? user.email : null;
  };