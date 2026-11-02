/**
 * Database seed script
 * Run: npx tsx src/database/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await argon2.hash('admin123456', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zyrostore.com' },
    update: {},
    create: {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@zyrostore.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.username}`);

  // Create demo customer
  const customerPassword = await argon2.hash('customer123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const customer = await prisma.user.upsert({
    where: { email: 'player1@example.com' },
    update: {},
    create: {
      id: 'user-001',
      username: 'player1',
      email: 'player1@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      emailVerified: true,
      minecraftUsername: 'Steve_Pro',
    },
  });
  console.log(`✅ Customer created: ${customer.username}`);

  // Create products
  const products = [
    { name: '100K Minecraft Coins', description: 'Get 100,000 Minecraft coins delivered directly to your account.', priceLTC: 0.015, deliveryAmount: '100,000', image: '💰', category: 'coins' },
    { name: '500K Minecraft Coins', description: 'Get 500,000 Minecraft coins. Great value for upgrading your gear.', priceLTC: 0.065, deliveryAmount: '500,000', image: '💎', category: 'coins' },
    { name: '1M Minecraft Coins', description: 'Get 1,000,000 Minecraft coins. Best value package for serious players.', priceLTC: 0.12, deliveryAmount: '1,000,000', image: '👑', category: 'coins' },
    { name: 'Custom Coin Amount', description: 'Request any custom amount of Minecraft coins.', priceLTC: 0.015, deliveryAmount: 'Custom', image: '🎯', category: 'coins' },
    { name: 'Enchanted Diamond Set', description: 'Full diamond armor with Protection IV, Unbreaking III, Mending.', priceLTC: 0.025, deliveryAmount: 'Diamond Set', image: '🛡️', category: 'items' },
    { name: 'Netherite Upgrade Kit', description: 'Complete netherite set with max enchantments.', priceLTC: 0.05, deliveryAmount: 'Netherite Kit', image: '⚔️', category: 'items' },
    { name: 'VIP Rank (30 Days)', description: '30-day VIP rank with /fly, /heal, custom prefix.', priceLTC: 0.08, deliveryAmount: 'VIP Rank', image: '⭐', category: 'services' },
    { name: 'Custom Build Service', description: 'Professional builder creates your dream structure.', priceLTC: 0.15, deliveryAmount: 'Custom Build', image: '🏰', category: 'services' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `prod-${product.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}` },
      update: {},
      create: {
        id: `prod-${product.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`,
        ...product,
        inStock: true,
        enabled: true,
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // Create default settings
  const settings = [
    { key: 'site_name', value: 'ZYRO STORE' },
    { key: 'support_email', value: 'support@zyrostore.com' },
    { key: 'ltc_confirmations', value: '3' },
    { key: 'payment_timeout_minutes', value: '30' },
    { key: 'maintenance_mode', value: 'false' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Settings created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Admin: admin@zyrostore.com / admin123456');
  console.log('   Customer: player1@example.com / customer123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
