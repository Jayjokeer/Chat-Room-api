import { Room } from '../model/room.model';



export const createRoom  = async (Payload: any) => {
  return await Room.create(Payload);
};

export const fetchRoomById = async (id: string) => {
  return await Room.findByPk(id);
};
