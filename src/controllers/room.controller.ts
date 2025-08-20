import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/error";
import { catchAsync } from "../errors/error-handler";
import { successResponse } from "../helpers/success-response";
import { comparePassword, hashPassword } from "../utils/encryption";
import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as roomService from "../services/room.service";
import * as roomMemberService from "../services/roomMembers.service";
import { IRoom } from "../types/room.interface";
import { JwtPayload } from "jsonwebtoken";

export const createRoomController = catchAsync( async (req: JwtPayload, res: Response) => {
    const { name, isPrivate } = req.body;
  const userId = req.user.id;
  const createdBy = userId;
    const payload : IRoom = {
        name,
        isPrivate,
        createdBy
    }
    if(isPrivate){
        payload.inviteCode = Math.random().toString(36).substring(2, 10);
    }
    const room = await roomService.createRoom(payload);
      return successResponse(res,StatusCodes.CREATED, {data: room});
});

export const joinRoomController = catchAsync( async (req: JwtPayload, res: Response) => {
    const { roomId, inviteCode } = req.body;
    const userId = req.user.id;
    const payload =  {
        roomId,
        userId
    }
    const room = await roomService.fetchRoomById(roomId);
    if(!room){
        throw new NotFoundError("Room does not exist")
    }
    if (room.isPrivate && room.inviteCode !== inviteCode) {
    throw new BadRequestError('Invalid invite code');
  }
    const roomMember = await roomMemberService.addRoomMember(payload);
    return successResponse(res,StatusCodes.OK, {data: roomMember});
  });

  export const getUserRooms = catchAsync(async (req: JwtPayload, res: Response) => {
    const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query; 

    const rooms = await roomMemberService.fetchAllRoomsByUserId(
        userId,
        Number(page),
        Number(limit)
    );
    return successResponse(res, StatusCodes.OK, { data: rooms });
  });