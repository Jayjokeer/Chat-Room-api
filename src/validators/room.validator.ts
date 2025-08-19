import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(1),
  isPrivate: z.boolean().optional().default(false)
});

export const joinRoomSchema = z.object({
  roomId: z.number().int().positive().optional(),
  inviteCode: z.string().optional()
}).refine(d => d.roomId || d.inviteCode, { message: "roomId or inviteCode is required" });