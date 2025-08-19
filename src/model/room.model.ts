import { DataTypes, Model } from "sequelize";
import  db  from "../config/database";
import {IRoom} from "../types/room.interface";

export class Room extends Model<IRoom> implements IRoom {
  public id!: string;
  public name!: string;
  public isPrivate!: boolean;
  public inviteCode?: string;
  public createdAt!: string;

  static associate(models: any) {
    Room.belongsToMany(models.User, {
      through: "UserRooms",
      foreignKey: "roomId",
    });

    Room.hasMany(models.Message, {
      foreignKey: "roomId",
      as: "messages",
    });
  }
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

  },
  { sequelize: db,
     modelName: "room" }
);
