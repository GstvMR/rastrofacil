import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/index';
import { hashPassword, verifyPassword } from '../utils/passwords';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { validate } from '../middlewares/validate';

const router = Router();

// Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7),
});
const loginSchema = registerSchema;

// Register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email já cadastrado' });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  const access = signAccess(user.id, user.role);
  const refresh = signRefresh(user.id);

  res
    .cookie('refresh', refresh, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json({ access });
});

// Login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  const access = signAccess(user.id, user.role);
  const refresh = signRefresh(user.id);

  res
    .cookie('refresh', refresh, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json({ access });
});

// Refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload: any = verifyRefresh(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error('User not found');
    const access = signAccess(user.id, user.role);
    const refresh = signRefresh(user.id);
    res.cookie('refresh', refresh, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.json({ access });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('refresh').sendStatus(204);
});

export default router;
