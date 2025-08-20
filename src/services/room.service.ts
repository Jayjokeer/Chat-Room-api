import { Message } from '../model/index.model';
import { Room } from '../model/room.model';
import { RoomMember } from '../model/roomMember.model';
import { IRoom } from '../types/room.interface';



export const createRoom  = async (Payload: IRoom) => {
  return await Room.create(Payload);
};

export const fetchRoomById = async (id: string) => {
  return await Room.findByPk(id);
};

export const fetchAllRooms = async () => {
  return await Room.findAll();
};
export const updateRoom = async (id: string, updates: Partial<IRoom>) => {
  return await Room.update(updates, {
    where: { id },
    returning: true,
  });
};
export const deleteRoom = async (id: string) => {
  return await Room.destroy({
    where: { id },
  });
};

