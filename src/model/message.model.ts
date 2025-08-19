import { DataTypes, Model } from "sequelize";
import  db  from "../config/database";
import { IMessage } from "../interfaces/message.interface";

export class Message extends Model<IMessage> implements IMessage {
  public id!: string;
  public content!: string;
  public timestamp!: Date;
}
Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize: db, modelName: "message" }
);
