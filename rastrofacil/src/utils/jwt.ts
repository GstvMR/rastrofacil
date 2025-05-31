import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export const signAccess = (sub: string, role: string) =>
  jwt.sign({ sub, role }, ACCESS_SECRET, { expiresIn: '15m' });

export const signRefresh = (sub: string) =>
  jwt.sign({ sub }, REFRESH_SECRET, { expiresIn: '30d' });

export const verifyAccess = (token: string) =>
  jwt.verify(token, ACCESS_SECRET);

export const verifyRefresh = (token: string) =>
  jwt.verify(token, REFRESH_SECRET);
