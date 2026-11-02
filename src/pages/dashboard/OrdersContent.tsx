import { motion } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function OrdersContent() {
  const { user, orders, updateOrderStatus } = useApp();
  const userOrders = [...orders.filter(o => o.userId === user?.id)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const simulatePayment = (orderId: string) => {
    updateOrderStatus(orderId, 'AWAITING_CONFIRMATIONS', `tx_${Date.now().toString(36)}`);
    setTimeout(() => {
      updateOrderStatus(orderId, 'PAID');
      setTimeout(() => {
        updateOrderStatus(orderId, 'QUEUED');
        setTimeout(() => {
          updateOrderStatus(orderId, 'DELIVERING');
          setTimeout(() => {
            updateOrderStatus(orderId, 'COMPLETED');
          }, 2000);
        }, 1500);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">My Orders</h2>
        <p className="text-white/50">Track your purchases and delivery status</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardList className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
          <p className="text-white/50">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                    {order.product.image}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{order.product.name}</h4>
                    <p className="text-xs text-white/40">Order: {order.id}</p>
                    <p className="text-xs text-white/40">MC: {order.minecraftUsername}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{order.ltcAmount} LTC</p>
                    <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${
                      order.status === 'COMPLETED' ? 'status-delivered' :
                      order.status === 'PENDING_PAYMENT' ? 'status-pending' :
                      order.status === 'DELIVERY_FAILED' || order.status === 'EXPIRED' ? 'status-failed' :
                      order.status === 'CANCELLED' ? 'status-expired' : 'status-paid'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {order.status === 'PENDING_PAYMENT' && (
                    <button
                      onClick={() => simulatePayment(order.id)}
                      className="btn-accent text-xs px-3 py-2 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Simulate Payment
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED' && order.status !== 'EXPIRED' && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {['PENDING_PAYMENT', 'AWAITING_CONFIRMATIONS', 'PAID', 'QUEUED', 'DELIVERING', 'COMPLETED'].map((step, idx) => {
                      const statusOrder = ['PENDING_PAYMENT', 'AWAITING_CONFIRMATIONS', 'PAID', 'QUEUED', 'DELIVERING', 'COMPLETED'];
                      const currentIdx = statusOrder.indexOf(order.status);
                      const isComplete = idx <= currentIdx;
                      return (
                        <div key={step} className="flex-1 flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-white/20'}`} />
                          {idx < 5 && <div className={`flex-1 h-0.5 ${idx < currentIdx ? 'bg-emerald-400' : 'bg-white/10'}`} />}
                        </div>
                      );
                    })}
                  </div>
                  {order.transactionId && (
                    <p className="text-xs text-white/30 mt-2">TX: {order.transactionId}</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
