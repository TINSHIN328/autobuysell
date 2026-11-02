import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PaymentVerifier - Polls the Litecoin blockchain for incoming payments.
 * 
 * SECURITY: This runs server-side only. Never trust client-side payment claims.
 * 
 * In production, this connects to Litecoin Core RPC or a block explorer API.
 * For development, it simulates the verification process.
 */
export class PaymentVerifier {
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 15000; // 15 seconds
  private readonly REQUIRED_CONFIRMATIONS = parseInt(process.env.LTC_REQUIRED_CONFIRMATIONS || '3');

  async startPolling() {
    console.log('💰 Payment verifier started - polling every', this.POLL_INTERVAL_MS, 'ms');
    this.pollingInterval = setInterval(() => this.checkPayments(), this.POLL_INTERVAL_MS);
    // Initial check
    await this.checkPayments();
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Payment verifier stopped');
    }
  }

  private async checkPayments() {
    try {
      // Find all pending payments
      const pendingPayments = await prisma.payment.findMany({
        where: { status: 'PENDING' },
        include: { order: true },
      });

      for (const payment of pendingPayments) {
        // Check if order has expired
        if (new Date() > payment.order.expiresAt) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status: 'FAILED' },
            });
            await tx.order.update({
              where: { id: payment.orderId },
              data: { status: 'EXPIRED' },
            });
          });
          console.log(`⏰ Order ${payment.orderId} expired`);
          continue;
        }

        // Query blockchain for transactions to this address
        const txInfo = await this.queryBlockchain(payment.address, payment.amount);

        if (txInfo) {
          // Check for duplicate transaction (replay attack prevention)
          const existingTx = await prisma.payment.findFirst({
            where: {
              transactionId: txInfo.txId,
              id: { not: payment.id },
            },
          });

          if (existingTx) {
            console.warn(`🚨 Duplicate transaction detected: ${txInfo.txId}`);
            continue; // Skip - this tx was already used for another payment
          }

          // Update payment with transaction info
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              transactionId: txInfo.txId,
              confirmations: txInfo.confirmations,
            },
          });

          // Update order confirmations
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              confirmations: txInfo.confirmations,
              transactionId: txInfo.txId,
              status: txInfo.confirmations >= this.REQUIRED_CONFIRMATIONS ? 'PAID' : 'AWAITING_CONFIRMATIONS',
              paidAt: txInfo.confirmations >= this.REQUIRED_CONFIRMATIONS ? new Date() : undefined,
            },
          });

          if (txInfo.confirmations >= this.REQUIRED_CONFIRMATIONS) {
            // Mark payment as confirmed
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'CONFIRMED', confirmedAt: new Date() },
            });

            // Add to delivery queue
            await this.addToDeliveryQueue(payment.orderId);
            console.log(`✅ Payment confirmed for order ${payment.orderId} (TX: ${txInfo.txId})`);
          } else {
            console.log(`⏳ Payment awaiting confirmations: ${txInfo.confirmations}/${this.REQUIRED_CONFIRMATIONS}`);
          }
        }
      }
    } catch (error) {
      console.error('Payment check error:', error);
    }
  }

  /**
   * Query the Litecoin blockchain for transactions to a specific address.
   * 
   * PRODUCTION IMPLEMENTATION:
   * Uses Litecoin Core RPC `listtransactions` or `gettransaction`
   * Alternatively, use a block explorer API like:
   * - https://litecoinspace.org/api
   * - https://blockchair.com/litecoin
   * - https://api.blockcypher.com/v1/ltc/main
   */
  private async queryBlockchain(address: string, expectedAmount: number): Promise<{ txId: string; confirmations: number } | null> {
    // PRODUCTION: Real Litecoin Core RPC call
    /*
    try {
      const response = await fetch(`http://${process.env.LTC_RPC_HOST}:${process.env.LTC_RPC_PORT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.LTC_RPC_USER}:${process.env.LTC_RPC_PASSWORD}`
          ).toString('base64'),
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          method: 'listtransactions',
          params: ['*', 100],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const transactions = data.result;
      for (const tx of transactions) {
        if (tx.address === address && 
            tx.category === 'receive' && 
            Math.abs(tx.amount - expectedAmount) < 0.00000001) {
          return {
            txId: tx.txid,
            confirmations: tx.confirmations,
          };
        }
      }
    } catch (error) {
      console.error('Blockchain query error:', error);
    }
    */

    // DEVELOPMENT: Simulated blockchain check (returns null = no payment found)
    // In production, remove this and uncomment the real implementation above
    return null;
  }

  /**
   * Add order to delivery queue after payment is confirmed.
   */
  private async addToDeliveryQueue(orderId: string) {
    await prisma.$transaction(async (tx) => {
      // Check if already in queue (idempotent)
      const existing = await tx.deliveryQueue.findUnique({ where: { orderId } });
      if (existing) return;

      await tx.deliveryQueue.create({
        data: {
          id: require('uuid').v4(),
          orderId,
          status: 'WAITING',
          priority: 0,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'QUEUED' },
      });
    });

    console.log(`📦 Order ${orderId} added to delivery queue`);
  }
}
