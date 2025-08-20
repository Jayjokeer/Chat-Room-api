import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";


export const validate =
  (schema: ObjectSchema, property: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      return res.status(400).json({
        errors: error.details.map((err) => err.message),
      });
    }
    (req as any)[property] = value; 
    next();
  };