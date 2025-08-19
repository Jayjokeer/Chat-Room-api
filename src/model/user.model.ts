import { DataTypes, Model, Sequelize } from "sequelize";
import  db  from "../config/database";
import { IUser } from "../interfaces/user.interface";



export class User extends Model<IUser> implements IUser {
  public id!: string;
  public displayName?: string;
  public email!: string;
  public password!: string;

  public static associate(models: any) {
    User.belongsToMany(models.Room, {
      through: "UserRooms",
      foreignKey: "userId",
    });

    User.hasMany(models.Message, {
      foreignKey: "userId",
      as: "messages",
    });
  }
}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lastSeen: { type: DataTypes.DATE, allowNull: true },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
    {
    sequelize: db,
    tableName: "user",
    }
  )

