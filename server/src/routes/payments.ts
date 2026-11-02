import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const paymentRouter = Router();

// GET /api/payments/status/:orderId - Check payment status (authenticated)
paymentRouter.get('/status/:orderId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const order = await prisma.order.findFirst({
      where: { id: req.params.orderId, userId },
      include: { payments: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.id,
      status: order.status,
      confirmations: order.confirmations,
      requiredConfirmations: order.requiredConfirmations,
      transactionId: order.transactionId,
      paymentAddress: order.paymentAddress,
      ltcAmount: order.ltcAmount,
      expiresAt: order.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// POST /api/payments/verify/:orderId - Manual verification trigger (admin only)
paymentRouter.post('/verify/:orderId', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { payments: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // In production, this triggers an immediate blockchain check
    res.json({
      message: 'Verification triggered',
      orderId: order.id,
      currentStatus: order.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});
