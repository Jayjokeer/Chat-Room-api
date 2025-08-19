import { Message } from './message.model';
import { Room } from './room.model';
import { RoomMember } from './roomMember.model';
import { User } from './user.model';


User.hasMany(RoomMember, { foreignKey: 'userId' });
Room.hasMany(RoomMember, { foreignKey: 'roomId' });
RoomMember.belongsTo(User, { foreignKey: 'userId' });
RoomMember.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Message, { foreignKey: 'userId' });
Room.hasMany(Message, { foreignKey: 'roomId' });
Message.belongsTo(User, { foreignKey: 'userId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

export { User, Room, RoomMember, Message };