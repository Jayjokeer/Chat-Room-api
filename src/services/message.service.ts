import { Message, User} from '../model/index.model';
import { IMessage } from '../types/message.interface';



export const createMessage = async (messagePayload: IMessage) => {
  return await Message.create(messagePayload);
};

export const fetchMessageById = async (id: string) => {
  return await Message.findByPk(id);
};

export const getRoomMessages = async (roomId: string) => {
  const messages = await Message.findAll({
    where: { roomId: roomId },
    include: [{ model: User, attributes: ['displayName'] }],
  });
  return messages;
};