import { DataTypes, Model } from "sequelize";
import db from "../config/database";
import { IUserRoom } from "../interfaces/userRooms.interface";

export class UserRoom extends Model<IUserRoom> implements IUserRoom {
  public id!: string;
  public userId!: string;
  public roomId!: string;
}

UserRoom.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    roomId: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize: db, tableName: "user_rooms" }
);