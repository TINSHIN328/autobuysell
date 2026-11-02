/**
 * ZYRO STORE - Minecraft Delivery Worker
 * 
 * This is a separate Node.js process that:
 * 1. Connects to the Minecraft server using Mineflayer
 * 2. Monitors the delivery queue in the database
 * 3. Executes delivery commands for paid orders
 * 4. Logs all delivery attempts
 * 5. Handles reconnection and error recovery
 * 
 * SECURITY:
 * - Only delivers orders with status QUEUED or DELIVERING
 * - Never delivers unpaid orders
 * - Idempotent - won't process the same order twice
 * - All actions are logged for audit purposes
 */

import * as mineflayer from 'mineflayer';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  server: process.env.MC_SERVER_HOST || 'localhost',
  port: parseInt(process.env.MC_SERVER_PORT || '25565'),
  username: process.env.MC_BOT_USERNAME || 'ZyroDeliveryBot',
  password: process.env.MC_BOT_PASSWORD || '',
  deliveryCommand: process.env.MC_DELIVERY_COMMAND || '/give {player} diamond {amount}',
  reconnectInterval: parseInt(process.env.MC_RECONNECT_INTERVAL_MS || '5000'),
  maxReconnectAttempts: parseInt(process.env.MC_MAX_RECONNECT_ATTEMPTS || '10'),
  pollInterval: 5000, // Check queue every 5 seconds
};

let bot: mineflayer.Bot | null = null;
let isConnected = false;
let reconnectAttempts = 0;
let isPaused = false;
let isProcessing = false;

/**
 * Create and connect the Minecraft bot
 */
function createBot(): mineflayer.Bot {
  console.log(`🎮 Connecting to ${CONFIG.server}:${CONFIG.port} as ${CONFIG.username}...`);

  const newBot = mineflayer.createBot({
    host: CONFIG.server,
    port: CONFIG.port,
    username: CONFIG.username,
    password: CONFIG.password || undefined,
    version: false, // Auto-detect version
  });

  newBot.on('login', () => {
    console.log('✅ Bot logged into Minecraft server');
    isConnected = true;
    reconnectAttempts = 0;
  });

  newBot.on('spawn', () => {
    console.log('🎯 Bot spawned in world');
  });

  newBot.on('chat', (username: string, message: string) => {
    console.log(`💬 [${username}]: ${message}`);
    // Could handle commands from authorized players here
  });

  newBot.on('kicked', (reason: string) => {
    console.warn('⚠️ Bot was kicked:', reason);
    isConnected = false;
    scheduleReconnect();
  });

  newBot.on('error', (err: Error) => {
    console.error('❌ Bot error:', err.message);
  });

  newBot.on('end', () => {
    console.log('🔌 Bot disconnected');
    isConnected = false;
    scheduleReconnect();
  });

  newBot.on('death', () => {
    console.log('💀 Bot died, will respawn...');
  });

  newBot.on('health', () => {
    // Monitor bot health
  });

  return newBot;
}

/**
 * Schedule reconnection after disconnect
 */
function scheduleReconnect() {
  if (reconnectAttempts >= CONFIG.maxReconnectAttempts) {
    console.error('🚨 Max reconnection attempts reached. Manual intervention required.');
    return;
  }

  reconnectAttempts++;
  const delay = CONFIG.reconnectInterval * reconnectAttempts;
  console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${CONFIG.maxReconnectAttempts})...`);

  setTimeout(() => {
    try {
      bot = createBot();
    } catch (err) {
      console.error('Reconnection failed:', err);
      scheduleReconnect();
    }
  }, delay);
}

/**
 * Process the delivery queue
 */
async function processQueue() {
  if (!isConnected || !bot || isPaused || isProcessing) return;

  isProcessing = true;

  try {
    // Get next item from queue
    const queueItem = await prisma.deliveryQueue.findFirst({
      where: {
        status: 'WAITING',
        attempts: { lt: 3 }, // Max 3 attempts
      },
      include: {
        order: {
          include: { product: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    if (!queueItem) {
      isProcessing = false;
      return;
    }

    // Verify order is actually paid (security check)
    if (queueItem.order.status !== 'QUEUED' && queueItem.order.status !== 'DELIVERING') {
      console.warn(`⚠️ Order ${queueItem.orderId} is not in deliverable status: ${queueItem.order.status}`);
      await prisma.deliveryQueue.update({
        where: { id: queueItem.id },
        data: { status: 'FAILED' },
      });
      isProcessing = false;
      return;
    }

    // Mark as processing
    await prisma.deliveryQueue.update({
      where: { id: queueItem.id },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    });

    await prisma.order.update({
      where: { id: queueItem.orderId },
      data: { status: 'DELIVERING' },
    });

    // Log delivery attempt
    await prisma.deliveryLog.create({
      data: {
        id: crypto.randomUUID(),
        orderId: queueItem.orderId,
        action: 'DELIVERY_START',
        message: `Starting delivery to ${queueItem.order.minecraftUsername}`,
        success: false,
      },
    });

    // Execute delivery command
    const success = await executeDelivery(queueItem.order);

    if (success) {
      // Mark as completed
      await prisma.deliveryQueue.update({
        where: { id: queueItem.id },
        data: { status: 'COMPLETED' },
      });

      await prisma.order.update({
        where: { id: queueItem.orderId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      await prisma.deliveryLog.create({
        data: {
          id: crypto.randomUUID(),
          orderId: queueItem.orderId,
          action: 'DELIVERY_SUCCESS',
          message: `Successfully delivered ${queueItem.order.product.name} to ${queueItem.order.minecraftUsername}`,
          success: true,
        },
      });

      console.log(`✅ Delivered order ${queueItem.orderId} to ${queueItem.order.minecraftUsername}`);
    } else {
      // Mark as failed
      const attempts = queueItem.attempts + 1;
      const newStatus = attempts >= 3 ? 'FAILED' : 'WAITING';

      await prisma.deliveryQueue.update({
        where: { id: queueItem.id },
        data: { status: newStatus as any },
      });

      if (newStatus === 'FAILED') {
        await prisma.order.update({
          where: { id: queueItem.orderId },
          data: { status: 'DELIVERY_FAILED' },
        });
      }

      await prisma.deliveryLog.create({
        data: {
          id: crypto.randomUUID(),
          orderId: queueItem.orderId,
          action: 'DELIVERY_FAILED',
          message: `Delivery attempt ${attempts} failed`,
          success: false,
        },
      });

      console.warn(`❌ Delivery failed for order ${queueItem.orderId} (attempt ${attempts})`);
    }
  } catch (error) {
    console.error('Queue processing error:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Execute the actual Minecraft delivery command
 */
async function executeDelivery(order: any): Promise<boolean> {
  return new Promise((resolve) => {
    if (!bot || !isConnected) {
      resolve(false);
      return;
    }

    try {
      // Build the delivery command from template
      // Template: /give {player} {item} {amount}
      let command = CONFIG.deliveryCommand
        .replace('{player}', order.minecraftUsername)
        .replace('{item}', order.product.deliveryAmount.toLowerCase().replace(/\s+/g, '_'))
        .replace('{amount}', '1');

      // For coin deliveries, use a different command pattern
      if (order.product.category === 'coins') {
        const coinAmount = parseInt(order.product.deliveryAmount.replace(/[^0-9]/g, ''));
        command = `/give ${order.minecraftUsername} emerald ${Math.ceil(coinAmount / 1000)}`;
      }

      console.log(`📤 Executing: ${command}`);

      // Send command as chat message (bot must have operator permissions)
      bot.chat(command);

      // Wait for potential response (simplified - in production, listen for specific events)
      setTimeout(() => {
        // Check if player received items (simplified check)
        // In production, you'd verify via inventory changes or server plugin callbacks
        resolve(true);
      }, 3000);

    } catch (error) {
      console.error('Delivery execution error:', error);
      resolve(false);
    }
  });
}

/**
 * Main worker loop
 */
async function main() {
  console.log('🤖 ZYRO STORE Minecraft Delivery Worker starting...');
  console.log(`📡 Server: ${CONFIG.server}:${CONFIG.port}`);
  console.log(`👤 Bot: ${CONFIG.username}`);

  // Connect to Minecraft
  bot = createBot();

  // Start queue polling
  setInterval(processQueue, CONFIG.pollInterval);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down worker...');
    if (bot) bot.quit();
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down worker...');
    if (bot) bot.quit();
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch(console.error);
