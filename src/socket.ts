import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User, Room, Message, RoomMember } from "./model/index.model";
import dotenv from "dotenv";
dotenv.config();

const onlineUsers = new Map<string, string>();

const messageRateMap = new Map<string, number[]>();

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  id: string;
  displayName: string;
}

export const chatSocket = (io: Server) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (socket as any).user = decoded; 
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    console.log(`User connected: ${user.id} (${socket.id})`);

    onlineUsers.set(user.id, socket.id);

    socket.on("join_room", async ({ roomId }) => {
      try {
        const membership = await RoomMember.findOne({ where: { userId: user.id, roomId } });
        if (!membership) {
          return socket.emit("error", { message: "Access denied to this room" });
        }

        socket.join(roomId);

        io.to(roomId).emit("user_status", { userId: user.id, displayName: user.displayName, status: "online" });

        const messages = await Message.findAll({
          where: { roomId },
          include: [{ model: User, attributes: ["id", "displayName"], as: "user" }],
          order: [["createdAt", "ASC"]],
          limit: 50,
        });
        socket.emit("load_messages", messages);

        const members = await RoomMember.findAll({
          where: { roomId },
          include: [{ model: User, attributes: ["id", "displayName"], as: "user" }],
        });
        socket.emit("load_members", members.map((m) => m.user));
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("send_message", async ({ roomId, content }) => {
      try {
        if (!content || !content.trim()) return socket.emit("error", { message: "Message content cannot be empty" });

        const timestamps = messageRateMap.get(user.id) || [];
        const now = Date.now();
        const windowStart = now - 10000; 
        const recent = timestamps.filter((t) => t > windowStart);
        if (recent.length >= 5) {
          return socket.emit("error", { message: "You have sent too many messages in a short period of time. Please slow down." });
        }
        recent.push(now);
        messageRateMap.set(user.id, recent);

        const membership = await RoomMember.findOne({ where: { userId: user.id, roomId } });
        if (!membership) {
          return socket.emit("error", { message: "Access denied to this room" });
        }

        const message = await Message.create({ userId: user.id, roomId, content });
        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, attributes: ["id", "displayName"], as: "user" }],
        });

        io.to(roomId).emit("receive_message", fullMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("typing", { userId: user.id });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(user.id);
      await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: user.id } });

      const rooms = await RoomMember.findAll({ where: { userId: user.id } });
      rooms.forEach((membership) => {
        io.to(membership.roomId).emit("user_status", { userId: user.id, displayName: user.displayName, status: "offline" });
      });

      console.log(`User disconnected: ${user.id}`);
    });
  });
};
