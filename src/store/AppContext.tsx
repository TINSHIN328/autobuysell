import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Product, Order, SupportTicket, Toast, AdminStats, BotStatus } from '../types';

interface AppState {
  user: User | null;
  products: Product[];
  orders: Order[];
  tickets: SupportTicket[];
  toasts: Toast[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  createOrder: (productId: string, mcUsername: string) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], txId?: string) => void;
  createTicket: (subject: string, description: string, orderId?: string) => void;
  addTicketMessage: (ticketId: string, content: string) => void;
  closeTicket: (ticketId: string) => void;
  getAdminStats: () => AdminStats;
  getBotStatus: () => BotStatus;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  deleteProduct: (id: string) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  users: User[];
}

const AppContext = createContext<AppContextType | null>(null);

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: '100K Minecraft Coins',
    description: 'Get 100,000 Minecraft coins delivered directly to your account. Perfect for starter packs and basic items.',
    priceLTC: 0.015,
    deliveryAmount: '100,000',
    image: '💰',
    category: 'coins',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-2',
    name: '500K Minecraft Coins',
    description: 'Get 500,000 Minecraft coins. Great value for upgrading your gear and building projects.',
    priceLTC: 0.065,
    deliveryAmount: '500,000',
    image: '💎',
    category: 'coins',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-3',
    name: '1M Minecraft Coins',
    description: 'Get 1,000,000 Minecraft coins. Best value package for serious players and traders.',
    priceLTC: 0.12,
    deliveryAmount: '1,000,000',
    image: '👑',
    category: 'coins',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-4',
    name: 'Custom Coin Amount',
    description: 'Request any custom amount of Minecraft coins. Price calculated per 100K coins.',
    priceLTC: 0.015,
    deliveryAmount: 'Custom',
    image: '🎯',
    category: 'coins',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Enchanted Diamond Set',
    description: 'Full diamond armor set with Protection IV, Unbreaking III, and Mending enchantments.',
    priceLTC: 0.025,
    deliveryAmount: 'Diamond Set',
    image: '🛡️',
    category: 'items',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-6',
    name: 'Netherite Upgrade Kit',
    description: 'Complete netherite upgrade kit including all tools and armor pieces with max enchantments.',
    priceLTC: 0.05,
    deliveryAmount: 'Netherite Kit',
    image: '⚔️',
    category: 'items',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-7',
    name: 'VIP Rank (30 Days)',
    description: '30-day VIP rank with exclusive perks: /fly, /heal, custom prefix, priority queue access.',
    priceLTC: 0.08,
    deliveryAmount: 'VIP Rank',
    image: '⭐',
    category: 'services',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-8',
    name: 'Custom Build Service',
    description: 'Professional builder creates a custom structure of your choice. Castles, bases, redstone machines.',
    priceLTC: 0.15,
    deliveryAmount: 'Custom Build',
    image: '🏰',
    category: 'services',
    inStock: true,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockUsers: User[] = [
  { id: 'user-1', username: 'admin', email: 'admin@zyrostore.com', role: 'admin', createdAt: '2024-01-01T00:00:00Z', isBanned: false },
  { id: 'user-2', username: 'player1', email: 'player1@example.com', role: 'customer', createdAt: '2024-01-15T00:00:00Z', isBanned: false, minecraftUsername: 'Steve_Pro' },
  { id: 'user-3', username: 'gamer99', email: 'gamer99@example.com', role: 'customer', createdAt: '2024-02-01T00:00:00Z', isBanned: false, minecraftUsername: 'GamerX99' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    products: defaultProducts,
    orders: [],
    tickets: [],
    toasts: [],
    isAuthenticated: false,
    isLoading: false,
  });

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setState(s => ({ ...s, toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    await new Promise(r => setTimeout(r, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email || u.username === email);
    if (foundUser) {
      if (foundUser.isBanned) {
        setState(s => ({ ...s, isLoading: false }));
        addToast('error', 'Your account has been banned.');
        return false;
      }
      setState(s => ({ ...s, user: foundUser, isAuthenticated: true, isLoading: false }));
      addToast('success', `Welcome back, ${foundUser.username}!`);
      return true;
    }
    setState(s => ({ ...s, isLoading: false }));
    addToast('error', 'Invalid credentials.');
    return false;
  }, [addToast]);

  const register = useCallback(async (username: string, email: string, _password: string): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    await new Promise(r => setTimeout(r, 1200));
    
    const exists = mockUsers.find(u => u.email === email || u.username === username);
    if (exists) {
      setState(s => ({ ...s, isLoading: false }));
      addToast('error', 'Username or email already exists.');
      return false;
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      role: 'customer',
      createdAt: new Date().toISOString(),
      isBanned: false,
    };
    
    setState(s => ({ ...s, user: newUser, isAuthenticated: true, isLoading: false }));
    addToast('success', 'Account created successfully! Welcome to ZYRO STORE.');
    return true;
  }, [addToast]);

  const logout = useCallback(() => {
    setState(s => ({ ...s, user: null, isAuthenticated: false }));
    addToast('info', 'Logged out successfully.');
  }, [addToast]);

  const createOrder = useCallback((productId: string, mcUsername: string): Order => {
    const product = state.products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    
    const addresses = [
      'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty',
      'ltc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    ];
    
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      userId: state.user!.id,
      productId,
      product,
      minecraftUsername: mcUsername,
      ltcAmount: product.priceLTC,
      paymentAddress: addresses[Math.floor(Math.random() * addresses.length)],
      status: 'PENDING_PAYMENT',
      confirmations: 0,
      requiredConfirmations: 3,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    
    setState(s => ({ ...s, orders: [...s.orders, order] }));
    addToast('success', 'Order created! Please complete payment.');
    return order;
  }, [state.products, state.user, addToast]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status'], txId?: string) => {
    setState(s => ({
      ...s,
      orders: s.orders.map(o => o.id === orderId ? {
        ...o,
        status,
        transactionId: txId || o.transactionId,
        confirmations: status === 'PAID' || status === 'COMPLETED' ? o.requiredConfirmations : o.confirmations,
        paidAt: status === 'PAID' ? new Date().toISOString() : o.paidAt,
        completedAt: status === 'COMPLETED' ? new Date().toISOString() : o.completedAt,
      } : o)
    }));
  }, []);

  const createTicket = useCallback((subject: string, description: string, orderId?: string) => {
    const ticket: SupportTicket = {
      id: `TKT-${Date.now().toString(36).toUpperCase()}`,
      userId: state.user!.id,
      subject,
      description,
      orderId,
      status: 'open',
      messages: [{
        id: `msg-${Date.now()}`,
        senderId: state.user!.id,
        senderName: state.user!.username,
        content: description,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, tickets: [...s.tickets, ticket] }));
    addToast('success', 'Support ticket created.');
  }, [state.user, addToast]);

  const addTicketMessage = useCallback((ticketId: string, content: string) => {
    setState(s => ({
      ...s,
      tickets: s.tickets.map(t => t.id === ticketId ? {
        ...t,
        messages: [...t.messages, {
          id: `msg-${Date.now()}`,
          senderId: s.user!.id,
          senderName: s.user!.username,
          content,
          isAdmin: s.user!.role === 'admin',
          createdAt: new Date().toISOString(),
        }]
      } : t)
    }));
  }, []);

  const closeTicket = useCallback((ticketId: string) => {
    setState(s => ({
      ...s,
      tickets: s.tickets.map(t => t.id === ticketId ? { ...t, status: 'closed' as const } : t)
    }));
    addToast('info', 'Ticket closed.');
  }, [addToast]);

  const getAdminStats = useCallback((): AdminStats => ({
    totalUsers: mockUsers.length,
    totalOrders: state.orders.length,
    totalLTCReceived: state.orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.ltcAmount, 0),
    pendingPayments: state.orders.filter(o => o.status === 'PENDING_PAYMENT').length,
    successfulDeliveries: state.orders.filter(o => o.status === 'COMPLETED').length,
    failedDeliveries: state.orders.filter(o => o.status === 'DELIVERY_FAILED').length,
  }), [state.orders]);

  const getBotStatus = useCallback((): BotStatus => ({
    connected: true,
    server: 'mc.zyrostore.com',
    port: 25565,
    username: 'ZyroDeliveryBot',
    queueLength: state.orders.filter(o => o.status === 'QUEUED' || o.status === 'DELIVERING').length,
    uptime: 86400 * 7,
  }), [state.orders]);

  const updateProduct = useCallback((product: Product) => {
    setState(s => ({ ...s, products: s.products.map(p => p.id === product.id ? product : p) }));
    addToast('success', 'Product updated.');
  }, [addToast]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, products: [...s.products, newProduct] }));
    addToast('success', 'Product created.');
  }, [addToast]);

  const deleteProduct = useCallback((id: string) => {
    setState(s => ({ ...s, products: s.products.filter(p => p.id !== id) }));
    addToast('info', 'Product deleted.');
  }, [addToast]);

  const banUser = useCallback((userId: string) => {
    setState(s => ({ ...s }));
    addToast('warning', 'User banned.');
  }, [addToast]);

  const unbanUser = useCallback((userId: string) => {
    setState(s => ({ ...s }));
    addToast('success', 'User unbanned.');
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      addToast,
      removeToast,
      createOrder,
      updateOrderStatus,
      createTicket,
      addTicketMessage,
      closeTicket,
      getAdminStats,
      getBotStatus,
      updateProduct,
      addProduct,
      deleteProduct,
      banUser,
      unbanUser,
      users: mockUsers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
