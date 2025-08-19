import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.DB_HOST)
export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) ,
  username: process.env.DB_USER ,
  password: process.env.DB_PASS ,
  database: process.env.DB_NAME ,
});

export default sequelize;
