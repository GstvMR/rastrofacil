import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization?.split(' ')[1];
  if (!bearer) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyAccess(bearer) as any;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid/expired' });
  }
}
