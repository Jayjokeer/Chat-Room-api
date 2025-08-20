import { Server, Socket } from "socket.io";
import { User, Room, Message, RoomMember } from "../src/model/index.model";

const onlineUsers = new Map<string, string>(); // userId => socketId

export const chatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // User joins a room
    socket.on("join_room", async ({ userId, roomId }) => {
      socket.join(roomId);
      onlineUsers.set(userId, socket.id);

      // Notify others in the room
      io.to(roomId).emit("user_status", { userId, status: "online" });

      // Fetch last 50 messages with user info
      const messages = await Message.findAll({
        where: { roomId },
        include: [{ model: User, attributes: ["id", "displayName"], as: "user" }],
        order: [["createdAt", "ASC"]],
        limit: 50,
      });

      socket.emit("load_messages", messages);

      // Fetch members (only id + displayName)
      const members = await RoomMember.findAll({
        where: { roomId },
        include: [{ model: User, attributes: ["id", "displayName"], as: "user" }],
      });

      socket.emit("load_members", members.map((m) => m.user));
    });

    // User sends a message
    socket.on("send_message", async ({ userId, roomId, content }) => {
      if (!content.trim()) return;

      const message = await Message.create({ userId, roomId, content });

      const fullMessage = await Message.findByPk(message.id, {
        include: [{ model: User, attributes: ["id", "displayName"], as: "user" }],
      });

      io.to(roomId).emit("receive_message", fullMessage);
    });

    // Typing indicator
    socket.on("typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("typing", { userId });
    });

    // Disconnect
    socket.on("disconnect", async () => {
      const userId = [...onlineUsers.entries()].find(([_, sid]) => sid === socket.id)?.[0];

      if (!userId) return;

      onlineUsers.delete(userId);
      await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: userId } });

      const rooms = await RoomMember.findAll({ where: { userId } });

      rooms.forEach((membership) => {
        io.to(membership.roomId).emit("user_status", { userId, status: "offline" });
      });
    });
  });
};