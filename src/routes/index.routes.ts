import { Router } from 'express';
import {AuthRoute} from './auth.routes';
import { RoomRoute } from './room.routes';


const router = Router();
router.use('/auth',  AuthRoute);
router.use('/rooms', RoomRoute);
export default router;