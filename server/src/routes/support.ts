import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
export const supportRouter = Router();

// GET /api/support/tickets - Get user's tickets
supportRouter.get('/tickets', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// POST /api/support/tickets - Create ticket
supportRouter.post('/tickets', requireAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().min(3).max(200),
      description: z.string().min(10).max(5000),
      orderId: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const userId = (req as any).user.id;

    const ticket = await prisma.supportTicket.create({
      data: {
        id: uuid(),
        userId,
        subject: data.subject,
        description: data.description,
        orderId: data.orderId,
        messages: {
          create: {
            id: uuid(),
            senderId: userId,
            content: data.description,
            isAdmin: false,
          },
        },
      },
      include: { messages: true },
    });

    res.status(201).json({ ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// POST /api/support/tickets/:id/messages - Add message
supportRouter.post('/tickets/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const schema = z.object({ content: z.string().min(1).max(2000) });
    const data = schema.parse(req.body);
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'ADMIN';

    const ticket = await prisma.supportTicket.findFirst({
      where: isAdmin ? { id: req.params.id } : { id: req.params.id, userId },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.status === 'CLOSED') return res.status(400).json({ error: 'Ticket is closed' });

    const message = await prisma.ticketMessage.create({
      data: {
        id: uuid(),
        ticketId: ticket.id,
        senderId: userId,
        content: data.content,
        isAdmin,
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/support/tickets/:id/close - Close ticket
supportRouter.patch('/tickets/:id/close', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.supportTicket.updateMany({
      where: { id: req.params.id, userId },
      data: { status: 'CLOSED' },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});
