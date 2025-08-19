import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { sendMessageSchema } from "./validators/messages.validator";
import * as authService from "./services/auth.service";

const JWT_SECRET = process.env.JWT_SECRET!;

// in-memory presence & rate limiting
const userSockets = new Map<number, Set<string>>(); // userId -> socketIds
const roomTyping = new Map<number, Set<number>>();  // roomId -> userIds typing

type RateBucket = { count: number; resetAt: number };
const msgBuckets = new Map<string, RateBucket>(); // socketId -> bucket

function canSendMessage(socketId: string): boolean {
  const now = Date.now();
  const bucket = msgBuckets.get(socketId);
  if (!bucket || now > bucket.resetAt) {
    msgBuckets.set(socketId, { count: 1, resetAt: now + 10_000 }); // 10s window
    return true;
  }
  if (bucket.count < 5) { // max 5 messages / 10s
    bucket.count += 1;
    return true;
  }
  return false;
}

export function attachSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    // expect token in query or headers
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.toString().replace("Bearer ", "");
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const user = (socket as any).user as { id: number; email: string };

    // presence: mark online (multi-device supported)
    if (!userSockets.has(user.id)) userSockets.set(user.id, new Set());
    userSockets.get(user.id)!.add(socket.id);
    await prisma.user.update({ where: { id: user.id }, data: { isOnline: true } });

    // announce status
    socket.on("user_status", async () => {
      // noop: client can request, we broadcast anyway on join_room
    });

    // join a room
    socket.on("join_room", async (roomId: number) => {
      if (!roomId) return;
      // check membership
      const member = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId: user.id } }
      });
      if (!member) {
        socket.emit("error", "Not a room member");
        return;
      }
      socket.join(`room:${roomId}`);

      // broadcast presence list
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: { user: { select: { id: true, displayName: true, isOnline: true, lastSeenAt: true } } }
      });
      io.to(`room:${roomId}`).emit("user_status", members.map((m: any) => m.user));
    });

    // typing indicator
    socket.on("typing", (payload: { roomId: number; isTyping: boolean }) => {
      const { roomId, isTyping } = payload || {};
      if (!roomId) return;
      if (!roomTyping.has(roomId)) roomTyping.set(roomId, new Set());
      const set = roomTyping.get(roomId)!;
      if (isTyping) set.add(user.id); else set.delete(user.id);
      socket.to(`room:${roomId}`).emit("typing", { roomId, userId: user.id, isTyping });
    });

    // send message
    socket.on("send_message", async (raw: any) => {
      if (!canSendMessage(socket.id)) {
        socket.emit("error", "Rate limit: max 5 messages per 10s.");
        return;
      }
      const parsed = sendMessageSchema.safeParse(raw);
      if (!parsed.success) {
        socket.emit("error", "Invalid message");
        return;
      }
      const { roomId, content } = parsed.data;

      // access control: must be member
      const membership = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId: user.id } }
      });
      if (!membership) {
        socket.emit("error", "Not authorized for this room");
        return;
      }

      const msg = await prisma.message.create({
        data: { roomId, senderId: user.id, content, delivered: true }
      });

      const payload = {
        id: msg.id,
        roomId,
        senderId: user.id,
        content,
        createdAt: msg.createdAt
      };

      // broadcast to room
      io.to(`room:${roomId}`).emit("receive_message", payload);
    });

    socket.on("disconnect", async () => {
      const set = userSockets.get(user.id);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(user.id);
          await prisma.user.update({
            where: { id: user.id },
            data: { isOnline: false, lastSeenAt: new Date() }
          });
        }
      }
    });
  });

  return io;
}
