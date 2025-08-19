import { DataTypes, Model, Sequelize } from "sequelize";
import  db  from "../config/database";
import { IUser } from "../interfaces/user.interface";



export class User extends Model<IUser> implements IUser {
  public id!: string;
  public displayName?: string;
  public email!: string;
  public password!: string;
}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required" },
        notEmpty: { msg: "Provide a password" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Email address required" },
        isEmail: { msg: "Please provide a valid email" },
      },
    },
  },
    {
    sequelize: db,
    tableName: "user",
    }
  )

