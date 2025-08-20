import { Router, Request, Response } from "express";
import * as roomController from "../controllers/room.controller";
import { userAuth } from "../middleware/authorization";
import { validate } from "../middleware/validation";
import { createRoomSchema, joinRoomSchema, getUserRoomsSchema  } from "../validators/room.validator";


const router = Router();


router.route("/create-room").post(userAuth,validate(createRoomSchema), roomController.createRoomController);
router.route("/join-room").post(userAuth,validate(joinRoomSchema), roomController.joinRoomController);
router.route("/user-rooms").get(userAuth, validate(getUserRoomsSchema, "query"),roomController.getUserRooms);

export { router as RoomRoute };
