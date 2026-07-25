import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { MulterError } from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
  error.isOperational = true;
  return error;
};

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

// ─── Known error translators ────────────────────────────────────────────────
// Mongoose/JWT/Multer errors are thrown by drivers, not by our own
// createError() calls, so they arrive here without a statusCode/isOperational
// flag. Without translation they'd all collapse into a generic 500. Each of
// these carries a specific, user-meaningful reason — surface it instead.

const handleValidationError = (err: MongooseError.ValidationError): AppError => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return createError(messages.join(' '), 400);
};

const handleCastError = (err: MongooseError.CastError): AppError => {
  return createError(`Invalid value for '${err.path}'.`, 400);
};

const handleDuplicateKeyError = (err: MongoServerError): AppError => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = field ? err.keyValue[field] : undefined;
  const message = field
    ? `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already in use. Please use a different value.`
    : 'A record with this value already exists.';
  return createError(message, 409);
};

const handleMulterError = (err: MulterError): AppError => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return createError('File is too large.', 413);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return createError(`Unexpected file field: ${err.field}.`, 400);
  }
  return createError(err.message || 'File upload failed.', 400);
};

const isMongoServerError = (err: AppError): err is MongoServerError =>
  (err as { code?: number }).code === 11000;

const normalizeError = (err: AppError): AppError => {
  if (err.name === 'ValidationError') {
    return handleValidationError(err as MongooseError.ValidationError);
  }
  if (err.name === 'CastError') {
    return handleCastError(err as MongooseError.CastError);
  }
  if (isMongoServerError(err)) {
    return handleDuplicateKeyError(err);
  }
  if (err instanceof MulterError) {
    return handleMulterError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    return createError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return createError('Your session has expired. Please log in again.', 401);
  }
  return err;
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const error = normalizeError(err);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: err,
      stack: err.stack,
    });
    return;
  }

  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error('💥 Unexpected Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server. Please try again later.',
    });
  }
};
