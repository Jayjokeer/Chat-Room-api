import { DataTypes, Model } from "sequelize";
import  db  from "../config/database";
import {IRoom} from "../types/room.interface";
import { User } from "./user.model";

export class Room extends Model<IRoom> implements IRoom {
  public id!: string;
  public name!: string;
  public isPrivate!: boolean;
  public inviteCode?: string;
  public createdAt!: string;
}
Room.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
    inviteCode: { type: DataTypes.STRING },
    createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    createdBy: {type: DataTypes.UUID,allowNull: false , references: {
        model: User,
        key: 'id',
      },}
  },
  { sequelize: db,
     modelName: "room" }
);
