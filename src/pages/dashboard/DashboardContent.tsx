import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, Clock, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function DashboardContent() {
  const { user, orders } = useApp();
  const userOrders = orders.filter(o => o.userId === user?.id);
  const completedOrders = userOrders.filter(o => o.status === 'COMPLETED');
  const pendingOrders = userOrders.filter(o => o.status === 'PENDING_PAYMENT');
  const recentOrders = [...userOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: 'Total Orders', value: userOrders.length, icon: ShoppingBag, color: 'from-purple-500 to-purple-600' },
    { label: 'Completed', value: completedOrders.length, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: pendingOrders.length, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Spent (LTC)', value: completedOrders.reduce((s, o) => s + o.ltcAmount, 0).toFixed(4), icon: CreditCard, color: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.username}! 👋</h2>
        <p className="text-white/50">Here's an overview of your account activity.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          <a href="#" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No orders yet</p>
            <p className="text-white/30 text-sm">Browse our store to make your first purchase</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">
                    {order.product.image}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{order.product.name}</p>
                    <p className="text-xs text-white/40">{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{order.ltcAmount} LTC</p>
                  <span className={`status-badge text-xs ${
                    order.status === 'COMPLETED' ? 'status-delivered' :
                    order.status === 'PENDING_PAYMENT' ? 'status-pending' :
                    order.status === 'DELIVERY_FAILED' ? 'status-failed' : 'status-paid'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minecraft Account */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Minecraft Account</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.minecraftUsername || 'Not linked'}</p>
            <p className="text-xs text-white/40">
              {user?.minecraftUsername ? 'Linked to your account' : 'Link your MC username in profile settings'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
