import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import Admin from '../models/Admin';
import { createError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookie
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(createError('You are not logged in. Please log in.', 401));
    }

    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id).select('+isActive');

    if (!admin) {
      return next(createError('Admin account no longer exists.', 401));
    }

    if (!admin.isActive) {
      return next(createError('Your account has been deactivated.', 401));
    }

    req.admin = { id: admin.id, email: admin.email, role: admin.role };
    next();
  } catch {
    next(createError('Invalid or expired token. Please log in again.', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(createError('You do not have permission for this action.', 403));
    }
    next();
  };
};
