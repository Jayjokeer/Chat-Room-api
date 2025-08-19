import { Request } from "express";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/error";
import { IUser } from "../types/user.interface";


export const generateJWTwithExpiryDate = (
  payload: IUser
) => {
  const exp = Math.floor(Date.now() / 1000) + 1 * 24 * 60 * 60; 
  const userJWT = jwt.sign({ ...payload, exp }, process.env.JWT_SECRET!);

  return userJWT;
};

export const verifyJWT = (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as IUser;
    console.log(payload)
    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new BadRequestError("Kindly log in!");
    } else {
      throw new BadRequestError("This token is invalid");
    }
  }
};
