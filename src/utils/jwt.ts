import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as JwtPayload;
};

export const sendTokenCookie = (
  res: import('express').Response,
  token: string
): void => {
  const cookieExpires = Number(process.env.COOKIE_EXPIRES_IN) || 30;
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: cookieExpires * 24 * 60 * 60 * 1000,
  });
};

export const clearTokenCookie = (res: import('express').Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
