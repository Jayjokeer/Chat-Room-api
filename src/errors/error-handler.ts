import { Request, Response, NextFunction } from 'express';
import AppError from './error';



export const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => next(err)); 
  };
};
const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction 
) => {

 if (!(err instanceof AppError)) {
    err = new AppError(err.message || 'Internal Server Error', 500);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    message: err.message,
    code: err.statusCode,
    status: err.status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default globalErrorHandler;