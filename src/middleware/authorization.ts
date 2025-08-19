import { NextFunction, Request, Response  } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../errors/error";
import { verifyJWT } from "../utils/jwt";
import * as authService from "../services/auth.service";

export const userAuth = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;
  
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      throw new UnauthorizedError("Kindly login to access this route");
    }
  
    try {
      const decode = verifyJWT(token);
      if (!decode || !decode.email) {
        throw new UnauthorizedError("Authentication Failure");
      }
  
      const user = await await authService.checkEmailExists(decode.email.toLowerCase());
      
      if (!user) {
        throw new UnauthorizedError("No user found");
      }
  
      req.user = user;
      next();
      
    } catch (error) {
      console.error("Auth Error:", error);
      throw new UnauthorizedError("Kindly login to access this route");      
    }
  };