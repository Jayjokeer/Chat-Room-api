import { Room, User , RoomMember} from '../model/index.model';
import { IRoomMember } from '../types/RoomMember.interface';



export const addRoomMember  = async (Payload: IRoomMember) => {
  return await RoomMember.create(Payload);
};

export const fetchMembersRoom = async (id: string) => {
  return await RoomMember.findOne({where: {userId: id}});
};

export const fetchAllRoomsByUserId = async (
    userId: string,  
    page: number = 1,
    limit: number = 10
) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await RoomMember.findAndCountAll({
    where: { userId },
    limit,
    offset,
    include: [
      {
        model: Room,
        as: 'room',
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'displayName'],
            through: { attributes: [] }, 
          },
        ],
      },
    ],
    distinct: true, 
  });

  return {
    rooms: rows.map(r => r.room), 
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};
