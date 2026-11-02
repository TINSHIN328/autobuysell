import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useState, useEffect } from 'react';

export function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState('');
  const [timeLeft, setTimeLeft] = useState(1800);

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          updateOrderStatus(order.id, 'EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [order, updateOrderStatus]);

  if (!order) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <Link to="/dashboard" className="text-purple-400 hover:text-purple-300">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const simulatePayment = () => {
    updateOrderStatus(order.id, 'AWAITING_CONFIRMATIONS', `tx_${Date.now().toString(36)}`);
    setTimeout(() => {
      updateOrderStatus(order.id, 'PAID');
      setTimeout(() => {
        updateOrderStatus(order.id, 'QUEUED');
        setTimeout(() => {
          updateOrderStatus(order.id, 'DELIVERING');
          setTimeout(() => {
            updateOrderStatus(order.id, 'COMPLETED');
          }, 3000);
        }, 2000);
      }, 2000);
    }, 3000);
  };

  const isCompleted = order.status === 'COMPLETED';
  const isProcessing = ['AWAITING_CONFIRMATIONS', 'PAID', 'QUEUED', 'DELIVERING'].includes(order.status);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {isCompleted ? (
          <div className="glass-card p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h2>
            <p className="text-white/50 mb-4">Your order has been completed and delivered.</p>
            <div className="p-4 rounded-xl bg-white/5 mb-6">
              <p className="text-sm text-white/60">Delivered to: <span className="text-white font-medium">{order.minecraftUsername}</span></p>
              <p className="text-sm text-white/60 mt-1">Product: <span className="text-white font-medium">{order.product.name}</span></p>
            </div>
            <Link to="/dashboard" className="btn-primary inline-block">Go to Dashboard</Link>
          </div>
        ) : isProcessing ? (
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
            <p className="text-white/50 mb-4">Verifying blockchain confirmations...</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-white/60">Status</span>
                <span className="status-badge status-paid">{order.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-white/60">Confirmations</span>
                <span className="text-sm text-white font-medium">{order.confirmations}/{order.requiredConfirmations}</span>
              </div>
              {order.transactionId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-white/60">Transaction</span>
                  <span className="text-xs text-cyan-400 font-mono">{order.transactionId.slice(0, 16)}...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Complete Payment</h2>
              <p className="text-white/50 text-sm">Send the exact amount to the address below</p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-mono">{formatTime(timeLeft)}</span>
              <span className="text-xs text-amber-400/60">remaining</span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG
                  value={`litecoin:${order.paymentAddress}?amount=${order.ltcAmount}`}
                  size={200}
                  level="M"
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 mb-1">Send Exactly</p>
                <p className="text-xl font-bold text-white">{order.ltcAmount} LTC</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 mb-1">To Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-cyan-400 font-mono flex-1 break-all">{order.paymentAddress}</p>
                  <button
                    onClick={() => copyToClipboard(order.paymentAddress, 'address')}
                    className="text-white/40 hover:text-white p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied === 'address' && <p className="text-xs text-emerald-400 mt-1">Copied!</p>}
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 mb-1">Order ID</p>
                <p className="text-sm text-white font-mono">{order.id}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 mb-1">Deliver to</p>
                <p className="text-sm text-white">{order.minecraftUsername}</p>
              </div>
            </div>

            {/* Demo button */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
              <p className="text-xs text-purple-300 mb-2">🧪 Demo Mode: Simulate payment verification</p>
              <button onClick={simulatePayment} className="btn-accent w-full text-sm">
                Simulate LTC Payment
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-white/30">
                Payment will be verified automatically after 3 blockchain confirmations.
                Do not send more or less than the exact amount.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
