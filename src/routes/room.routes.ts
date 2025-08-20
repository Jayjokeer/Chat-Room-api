import { Router, Request, Response } from "express";
import * as roomController from "../controllers/room.controller";
import { userAuth } from "../middleware/authorization";
// import { validateLogin, validateRegistration } from "../validators/auth.validator";


const router = Router();


router.route("/create-room").post(userAuth, roomController.createRoomController);
router.route("/join-room").post(userAuth, roomController.joinRoomController);
router.route("/user-rooms").get(userAuth, roomController.getUserRooms);

export { router as RoomRoute };
