export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'AWAITING_CONFIRMATIONS' 
  | 'PAID' 
  | 'QUEUED' 
  | 'DELIVERING' 
  | 'COMPLETED' 
  | 'DELIVERY_FAILED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
  isBanned: boolean;
  minecraftUsername?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  priceLTC: number;
  deliveryAmount: string;
  image: string;
  category: string;
  inStock: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  minecraftUsername: string;
  ltcAmount: number;
  paymentAddress: string;
  transactionId?: string;
  status: OrderStatus;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  expiresAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  address: string;
  amount: number;
  transactionId?: string;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  orderId?: string;
  status: 'open' | 'closed';
  messages: TicketMessage[];
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalLTCReceived: number;
  pendingPayments: number;
  successfulDeliveries: number;
  failedDeliveries: number;
}

export interface BotStatus {
  connected: boolean;
  server: string;
  port: number;
  username: string;
  queueLength: number;
  uptime: number;
}
