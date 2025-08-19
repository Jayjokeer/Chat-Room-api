import { DataTypes, Model } from "sequelize";
import db from "../config/database";
import { IRoomMember } from "../types/RoomMember.interface";
import { User } from "./user.model";
import { Room } from "./room.model";

export class RoomMember extends Model<IRoomMember> implements IRoomMember{
  public id!: string;
  public userId!: string;
  public roomId!: string;
}

RoomMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false, references: {
        model: User,
        key: 'id',
      }, },
    roomId: { type: DataTypes.UUID, allowNull: false , references: {
        model: Room,
        key: 'id',
      },},
  },
  { sequelize: db, tableName: "room_members" }
);