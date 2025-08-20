import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.routes';
import globalErrorHandler from './errors/error-handler';
import AppError from './errors/error';
import db from "./config/database";
import { chatSocket } from './socket';
import http from "http";
import { Server } from "socket.io";
dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

chatSocket(io);

app.use(express.json());
app.use('/api/v1', routes);

app.all('/*splat', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler); 
const startServer = async () => {
  try {
    await db.sync({ alter: false}); 
    console.log('✅ Database synced');
    server.listen(process.env.PORT || 4000, () => {
      console.log(`Server running on port ${process.env.PORT || 4000}`);
    });
  } catch (error) {
    console.error('❌ DB sync error:', error);
  }
};

startServer();

export default server;
