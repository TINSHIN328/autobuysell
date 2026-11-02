import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId;
  const token = (req.session as any)?.token;

  if (!userId || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify session exists and is not expired
  const session = await prisma.session.findFirst({
    where: {
      userId,
      token,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }

  // Check if user is banned
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isBanned) {
    return res.status(403).json({ error: 'Account banned' });
  }

  (req as any).user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
