import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/error";
import { catchAsync } from "../errors/error-handler";
import { successResponse } from "../helpers/success-response";
import { comparePassword, hashPassword } from "../utils/encryption";
import { NextFunction, Request, Response } from "express";
import { generateJWTwithExpiryDate } from "../utils/jwt";
import * as authService from "../services/auth.service";

export const registerUserController = catchAsync( async (req: Request, res: Response) => {
    const {
      displayName,
      email,
      password,
    } = req.body;
    const userEmail = email.toLowerCase();
    const isEmailExists = await authService.checkEmailExists(userEmail);
    if(isEmailExists) throw new BadRequestError("User with email already exists!");

    const encryptPwd = await hashPassword(password);

    const userPayload= {
      displayName,
      email: userEmail,
      password: encryptPwd,
    }
     await authService.createUser(userPayload);
      const data = {
        email: userEmail,
        displayName,
      };
      return successResponse(res,StatusCodes.CREATED, data);
});

export const loginController = catchAsync( async (req: Request, res: Response) => {
    const { email, password } = req.body;

      const user = await authService.checkEmailExists(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }
  
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestError('Invalid email or password');
      }
  
      const token =  generateJWTwithExpiryDate({email: user.email, id: user.id, displayName: user.displayName});
  
      return successResponse(res, StatusCodes.OK, token);

  }); 