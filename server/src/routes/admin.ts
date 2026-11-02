import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';

const prisma = new PrismaClient();
export const adminRouter = Router();

// All admin routes require admin role
adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/stats
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalOrders, completedOrders, pendingOrders, failedDeliveries] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { status: 'DELIVERY_FAILED' } }),
    ]);

    const totalLTC = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { ltcAmount: true },
    });

    res.json({
      totalUsers,
      totalOrders,
      totalLTCReceived: totalLTC._sum.ltcAmount || 0,
      pendingPayments: pendingOrders,
      successfulDeliveries: completedOrders,
      failedDeliveries: failedDeliveries,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/users
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, role: true,
        isBanned: true, createdAt: true, minecraftUsername: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/ban
adminRouter.patch('/users/:id/ban', async (req: Request, res: Response) => {
  try {
    const { banned } = z.object({ banned: z.boolean() }).parse(req.body);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: banned },
    });
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user.id,
        action: banned ? 'USER_BANNED' : 'USER_UNBANNED',
        details: `User ${req.params.id}`,
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// GET /api/admin/orders
adminRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { product: true, user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/admin/orders/:id/retry-delivery
adminRouter.post('/orders/:id/retry-delivery', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.status !== 'DELIVERY_FAILED') {
      return res.status(400).json({ error: 'Order not eligible for retry' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'QUEUED' },
      });
      await tx.deliveryQueue.upsert({
        where: { orderId: order.id },
        create: { id: require('uuid').v4(), orderId: order.id, status: 'WAITING', attempts: 0 },
        update: { status: 'WAITING', attempts: { increment: 1 } },
      });
    });

    res.json({ success: true, message: 'Delivery retry queued' });
  } catch (error) {
    res.status(500).json({ error: 'Retry failed' });
  }
});

// Products CRUD
adminRouter.post('/products', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      description: z.string(),
      priceLTC: z.number().positive(),
      deliveryAmount: z.string(),
      image: z.string().default('💰'),
      category: z.string(),
      inStock: z.boolean().default(true),
      enabled: z.boolean().default(true),
    });
    const data = schema.parse(req.body);
    const product = await prisma.product.create({
      data: { id: require('uuid').v4(), ...data },
    });
    res.status(201).json({ product });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

adminRouter.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ product });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

adminRouter.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

// Settings
adminRouter.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    res.json({ settings: settingsMap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

adminRouter.put('/settings', async (req: Request, res: Response) => {
  try {
    const settings = z.record(z.string()).parse(req.body);
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update settings' });
  }
});
