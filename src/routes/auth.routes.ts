import { Router, Request, Response } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validation";
import { loginSchema, registerSchema } from "../validators/auth.validator";


const router = Router();

router.route("/").get((req: Request, res: Response) => {
  res.json({ message: "Welcome to Chat app" });
});
router.route("/sign-up").post(validate(registerSchema), authController.registerUserController);
router.route("/login").post(validate(loginSchema), authController.loginController);

export { router as AuthRoute };
