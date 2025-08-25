import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { config } from '@ecommerce/config';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Array<{ field: string; message: string }> = [];

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
  
  // Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    
    switch (error.code) {
      case 'P2002':
        message = 'A record with this information already exists';
        const field = error.meta?.target as string[];
        if (field?.[0]) {
          errors = [{ field: field[0], message: `${field[0]} already exists` }];
        }
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      default:
        message = 'Database error occurred';
    }
  }
  
  // App errors (custom errors)
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error in development
  if (config.isDevelopment) {
    console.error('Error:', error);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors.length > 0 && { errors }),
    ...(config.isDevelopment && { stack: error.stack }),
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};