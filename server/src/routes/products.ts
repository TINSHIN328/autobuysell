import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
export const productRouter = Router();

// GET /api/products - List all enabled products
productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { enabled: true, inStock: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
productRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});
