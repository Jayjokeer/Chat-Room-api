import { Message } from './message.model';
import { Room } from './room.model';
import { RoomMember } from './roomMember.model';
import { User } from './user.model';


User.hasMany(RoomMember, { foreignKey: 'userId', as: 'memberships'  });
Room.hasMany(RoomMember, { foreignKey: 'roomId', as: 'roomMembers' });

RoomMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
RoomMember.belongsTo(Room, { foreignKey: 'roomId', as: 'room'  });

User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Room.hasMany(Message, { foreignKey: 'roomId', as: 'messages' });

Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Message.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

User.belongsToMany(Room, {
  through: RoomMember,
  foreignKey: 'userId',
  as: 'rooms',
});

Room.belongsToMany(User, {
  through: RoomMember,
  foreignKey: 'roomId',
  as: 'members',
});

export { User, Room, RoomMember, Message };