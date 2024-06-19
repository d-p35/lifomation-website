import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { port } from './config/config';
import { dataSource } from './db/database';
import { User } from './models/user';
import { UsersRouter } from './routers/Users';

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


dataSource.initialize().then(() => {
  console.log('Database connection established.');

  // Dummy route
  app.use('/api/users', UsersRouter);

  // Start the server
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}).catch((error: any) => {
  console.error('Error connecting to the database:', error);
});