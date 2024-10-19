import { Router } from "express";
import { Request, Response } from "express";
import { User } from "../models/user";
import { dataSource } from "../db/database";
import { validateAccessToken } from "../middleware/validateToken";
import { GovernmentUtils } from "../models/governmentutils";
import { Health } from "../models/health";

export const UsersRouter = Router();

const userRepo = dataSource.getRepository(User);
const govtUtilsRepo = dataSource.getRepository(GovernmentUtils);
const healthRepo = dataSource.getRepository(Health);


UsersRouter.post("/", async (req: Request, res: Response) => {
  try {

    const userId = req.auth?.payload.sub;

    if (!userId) {
      return res.status(401).json({ message: "User not logged In" });
    }

    if (!req.body.email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await userRepo.findOne({ where: { id: req.body.userId } });
    if (user) {
      return res.status(200).json({ message: "User already exists" });
    }

    const newUser: User = {
      id: userId,
      email: req.body.email,
      documents: [],
      governmentUtils: new GovernmentUtils(),
      health: new Health(),
    };

    const returnedUser = await userRepo.save(newUser);

    const govtUtils : GovernmentUtils = {
      name: "Government and Utilities",
      ownerId: returnedUser.id,
      owner: returnedUser,
      documents: [],
      folderKeyInfo: {}
    }

    await govtUtilsRepo.save(govtUtils);

    const health: Health = {
      name: "Health",
      ownerId: returnedUser.id,
      owner: returnedUser,
      documents: [],
      folderKeyInfo: {}
    }

    await healthRepo.save(health);

    res.status(200);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// UsersRouter.get("/", validateAccessToken, async (req: Request, res: Response) => {
//   try {
//     console.log("Token"+ req.auth?.payload.sub)
//     const allUsers = await userRepo.find();
//     res.status(200).json({ users: req.auth });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// });


