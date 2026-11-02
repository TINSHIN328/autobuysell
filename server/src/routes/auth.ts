import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';

const prisma = new PrismaClient();
export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        username: data.username,
        email: data.email,
        passwordHash,
      },
    });

    // Create session
    const sessionToken = uuid();
    await prisma.session.create({
      data: {
        id: uuid(),
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.id);

    // Set session cookie
    (req.session as any).userId = user.id;
    (req.session as any).token = sessionToken;

    // Audit log
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_REGISTERED', ipAddress: req.ip },
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.email }] },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Verify password
    const validPassword = await argon2.verify(user.passwordHash, data.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionToken = uuid();
    await prisma.session.create({
      data: {
        id: uuid(),
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    (req.session as any).userId = user.id;
    (req.session as any).token = sessionToken;

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_LOGIN', ipAddress: req.ip },
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        minecraftUsername: user.minecraftUsername,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', requireAuth, async (req: Request, res: Response) => {
  const token = (req.session as any).token;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.json({ message: 'Logged out' });
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      await sendPasswordResetEmail(user.email, user.id);
    }
    
    // Always return success to prevent email enumeration
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, role: true, minecraftUsername: true, createdAt: true },
  });
  res.json({ user });
});
