import { DataTypes, Model } from "sequelize";
import  db  from "../config/database";
import { IMessage } from "../types/message.interface";
import { Room } from "./room.model";
import { User } from "./user.model";

export class Message extends Model<IMessage> implements IMessage {
  public id!: string;
  public content!: string;
  public createdAt!: Date;
  public userId!: string;
  public roomId!: string;
}
Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    roomId: {
      type: DataTypes.UUID,
      references: {
        model: Room,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  { sequelize: db, modelName: "message" }
);
