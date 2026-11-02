import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
export const orderRouter = Router();

const createOrderSchema = z.object({
  productId: z.string().uuid(),
  minecraftUsername: z.string().min(1).max(16).regex(/^[a-zA-Z0-9_]+$/),
});

// POST /api/orders - Create new order
orderRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = (req as any).user.id;

    // Get product
    const product = await prisma.product.findFirst({
      where: { id: data.productId, enabled: true, inStock: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    // Generate unique payment address
    // In production, this would call Litecoin Core's getnewaddress RPC
    const paymentAddress = await generatePaymentAddress();

    // Create order with transaction safety
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          id: uuid(),
          userId,
          productId: product.id,
          minecraftUsername: data.minecraftUsername,
          ltcAmount: product.priceLTC,
          paymentAddress,
          status: 'PENDING_PAYMENT',
          requiredConfirmations: parseInt(process.env.LTC_REQUIRED_CONFIRMATIONS || '3'),
          expiresAt: new Date(Date.now() + (parseInt(process.env.LTC_PAYMENT_TIMEOUT_MINUTES || '30') * 60 * 1000)),
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          id: uuid(),
          orderId: newOrder.id,
          address: paymentAddress,
          amount: product.priceLTC,
          status: 'PENDING',
        },
      });

      return newOrder;
    });

    await prisma.auditLog.create({
      data: { userId, action: 'ORDER_CREATED', details: `Order ${order.id} for product ${product.name}` },
    });

    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Get user's orders
orderRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order
orderRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId },
      include: { product: true, payments: true, deliveryLogs: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Helper: Generate unique LTC payment address
// In production, this calls Litecoin Core RPC: getnewaddress
async function generatePaymentAddress(): Promise<string> {
  // Production implementation:
  // const response = await fetch(`http://${process.env.LTC_RPC_HOST}:${process.env.LTC_RPC_PORT}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   auth: `${process.env.LTC_RPC_USER}:${process.env.LTC_RPC_PASSWORD}`,
  //   body: JSON.stringify({ jsonrpc: '1.0', method: 'getnewaddress', params: ['zyro_store'] }),
  // });
  // const data = await response.json();
  // return data.result;
  
  // Development fallback
  const addresses = [
    'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty',
    'ltc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    'ltc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}
