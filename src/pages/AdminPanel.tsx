import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, ShoppingBag, ClipboardList, CreditCard, Bot, Settings, 
  Zap, ArrowLeft, Plus, Edit, Trash2, Search, RefreshCw, Pause, Play,
  CheckCircle, XCircle, Clock, AlertTriangle, Eye, Ban, Unlock
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Product } from '../types';

type AdminTab = 'overview' | 'users' | 'products' | 'orders' | 'payments' | 'bot' | 'settings';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { getAdminStats, getBotStatus, products, orders, users, addProduct, updateProduct, deleteProduct, addToast } = useApp();
  const stats = getAdminStats();
  const botStatus = getBotStatus();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'bot', label: 'MC Bot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col min-h-screen">
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Admin Panel</span>
            <span className="text-xs text-white/40">ZYRO STORE</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`sidebar-item w-full flex items-center gap-3 text-sm ${activeTab === tab.id ? 'active text-white' : 'text-white/60 hover:text-white'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <a href="/dashboard" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <UsersTab users={users} />}
          {activeTab === 'products' && <ProductsTab products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} addToast={addToast} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} />}
          {activeTab === 'payments' && <PaymentsTab orders={orders} />}
          {activeTab === 'bot' && <BotTab botStatus={botStatus} />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </main>
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ClipboardList, color: 'from-cyan-500 to-cyan-600' },
    { label: 'LTC Received', value: stats.totalLTCReceived.toFixed(4), icon: CreditCard, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Deliveries OK', value: stats.successfulDeliveries, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Deliveries Failed', value: stats.failedDeliveries, icon: XCircle, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Admin Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-white/50">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: any[] }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 w-64" placeholder="Search users..." />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-sm text-white/50 font-medium">User</th>
              <th className="text-left p-4 text-sm text-white/50 font-medium">Email</th>
              <th className="text-left p-4 text-sm text-white/50 font-medium">Role</th>
              <th className="text-left p-4 text-sm text-white/50 font-medium">Status</th>
              <th className="text-left p-4 text-sm text-white/50 font-medium">Joined</th>
              <th className="text-left p-4 text-sm text-white/50 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-white/60">{user.email}</td>
                <td className="p-4"><span className={`status-badge text-xs ${user.role === 'admin' ? 'status-paid' : 'status-pending'}`}>{user.role}</span></td>
                <td className="p-4"><span className={`status-badge text-xs ${user.isBanned ? 'status-failed' : 'status-delivered'}`}>{user.isBanned ? 'Banned' : 'Active'}</span></td>
                <td className="p-4 text-sm text-white/40">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"><Eye className="w-3.5 h-3.5" /></button>
                    {user.role !== 'admin' && (
                      <button className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"><Ban className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsTab({ products, addProduct, updateProduct, deleteProduct, addToast }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', priceLTC: 0, deliveryAmount: '', image: '💰', category: 'coins', inStock: true, enabled: true });

  const handleAdd = () => {
    addProduct(form);
    setShowAdd(false);
    setForm({ name: '', description: '', priceLTC: 0, deliveryAmount: '', image: '💰', category: 'coins', inStock: true, enabled: true });
  };

  const handleEdit = () => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...form });
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Product Management</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <div key={product.id} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{product.image}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditingProduct(product); setForm({ name: product.name, description: product.description, priceLTC: product.priceLTC, deliveryAmount: product.deliveryAmount, image: product.image, category: product.category, inStock: product.inStock, enabled: product.enabled }); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="font-semibold text-white text-sm">{product.name}</h4>
            <p className="text-xs text-white/40 mt-1">{product.description.slice(0, 60)}...</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-bold gradient-text">{product.priceLTC} LTC</span>
              <span className={`status-badge text-xs ${product.enabled ? 'status-delivered' : 'status-expired'}`}>
                {product.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || editingProduct) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditingProduct(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Price (LTC)</label>
                  <input type="number" step="0.001" value={form.priceLTC} onChange={e => setForm({...form, priceLTC: parseFloat(e.target.value)})} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Delivery Amount</label>
                  <input type="text" value={form.deliveryAmount} onChange={e => setForm({...form, deliveryAmount: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Emoji Icon</label>
                  <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    <option value="coins">Coins</option>
                    <option value="items">Items</option>
                    <option value="services">Services</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.inStock} onChange={e => setForm({...form, inStock: e.target.checked})} className="accent-purple-500" />
                  <span className="text-sm text-white/70">In Stock</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})} className="accent-purple-500" />
                  <span className="text-sm text-white/70">Enabled</span>
                </label>
              </div>
              <button onClick={editingProduct ? handleEdit : handleAdd} className="btn-primary w-full">
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function OrdersTab({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Order Management</h2>
      
      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No orders yet</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs text-white/50 font-medium">Order ID</th>
                <th className="text-left p-4 text-xs text-white/50 font-medium">Product</th>
                <th className="text-left p-4 text-xs text-white/50 font-medium">MC User</th>
                <th className="text-left p-4 text-xs text-white/50 font-medium">Amount</th>
                <th className="text-left p-4 text-xs text-white/50 font-medium">Status</th>
                <th className="text-left p-4 text-xs text-white/50 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-xs text-cyan-400 font-mono">{order.id}</td>
                  <td className="p-4 text-sm text-white">{order.product.name}</td>
                  <td className="p-4 text-sm text-white/60">{order.minecraftUsername}</td>
                  <td className="p-4 text-sm text-white">{order.ltcAmount} LTC</td>
                  <td className="p-4">
                    <span className={`status-badge text-xs ${
                      order.status === 'COMPLETED' ? 'status-delivered' :
                      order.status === 'PENDING_PAYMENT' ? 'status-pending' :
                      order.status === 'DELIVERY_FAILED' ? 'status-failed' : 'status-paid'
                    }`}>{order.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="p-4 text-xs text-white/40">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ orders }: { orders: any[] }) {
  const paidOrders = orders.filter(o => o.status !== 'PENDING_PAYMENT');
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Payment Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-white/50">Payment Provider</p>
          <p className="text-lg font-semibold text-white mt-1">Litecoin Core RPC</p>
          <span className="status-badge status-delivered text-xs mt-2 inline-block">Connected</span>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-white/50">Required Confirmations</p>
          <p className="text-lg font-semibold text-white mt-1">3</p>
          <p className="text-xs text-white/30 mt-2">Configurable</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-white/50">Verified Payments</p>
          <p className="text-lg font-semibold text-white mt-1">{paidOrders.length}</p>
          <p className="text-xs text-white/30 mt-2">All blockchain-verified</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Verification Log</h3>
        {paidOrders.length === 0 ? (
          <p className="text-white/40 text-sm">No verified payments yet</p>
        ) : (
          <div className="space-y-2">
            {paidOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-sm text-white">{order.id}</p>
                    <p className="text-xs text-white/40 font-mono">{order.transactionId || 'pending'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{order.ltcAmount} LTC</p>
                  <p className="text-xs text-white/40">{order.confirmations}/{order.requiredConfirmations} conf.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BotTab({ botStatus }: { botStatus: any }) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Minecraft Bot Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${botStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm font-medium text-white">{botStatus.connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-white/50">Server</span><span className="text-sm text-white">{botStatus.server}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/50">Port</span><span className="text-sm text-white">{botStatus.port}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/50">Bot Username</span><span className="text-sm text-white">{botStatus.username}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/50">Queue Length</span><span className="text-sm text-white">{botStatus.queueLength}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/50">Uptime</span><span className="text-sm text-white">{Math.floor(botStatus.uptime / 3600)}h</span></div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h4 className="text-sm font-medium text-white mb-4">Controls</h4>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-500/30">
              <Play className="w-4 h-4" /> Start Worker
            </button>
            <button className="w-full px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-500/30">
              <XCircle className="w-4 h-4" /> Stop Worker
            </button>
            <button onClick={() => setIsPaused(!isPaused)} className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${isPaused ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/5 border border-white/10 text-white/70'}`}>
              {isPaused ? <><Play className="w-4 h-4" /> Resume Delivery</> : <><Pause className="w-4 h-4" /> Pause Delivery</>}
            </button>
            <button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10">
              <RefreshCw className="w-4 h-4" /> Retry Failed
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Delivery Logs</h3>
        <div className="space-y-2">
          {[
            { time: '2 min ago', msg: 'Order ORD-X7K2M delivered to Steve_Pro', status: 'success' },
            { time: '5 min ago', msg: 'Order ORD-P3N8Q delivered to GamerX99', status: 'success' },
            { time: '12 min ago', msg: 'Bot reconnected to mc.zyrostore.com', status: 'info' },
            { time: '1 hour ago', msg: 'Worker started successfully', status: 'info' },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              {log.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-cyan-400" />}
              <span className="text-sm text-white/70 flex-1">{log.msg}</span>
              <span className="text-xs text-white/30">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">General</h3>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Website Name</label>
          <input type="text" defaultValue="ZYRO STORE" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Support Email</label>
          <input type="email" defaultValue="support@zyrostore.com" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Support Discord</label>
          <input type="text" defaultValue="discord.gg/zyrostore" className="input-field" />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Litecoin Configuration</h3>
        <div>
          <label className="text-sm text-white/70 mb-1 block">RPC Host</label>
          <input type="text" defaultValue="127.0.0.1" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">RPC Port</label>
          <input type="text" defaultValue="9332" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">RPC Username</label>
          <input type="text" defaultValue="ltcrpc" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Required Confirmations</label>
          <input type="number" defaultValue={3} className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Payment Timeout (minutes)</label>
          <input type="number" defaultValue={30} className="input-field" />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Minecraft Server</h3>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Server Address</label>
          <input type="text" defaultValue="mc.zyrostore.com" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Server Port</label>
          <input type="number" defaultValue={25565} className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Bot Username</label>
          <input type="text" defaultValue="ZyroDeliveryBot" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-white/70 mb-1 block">Delivery Command</label>
          <input type="text" defaultValue="/give {player} {item} {amount}" className="input-field" />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Maintenance</h3>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="accent-purple-500 w-4 h-4" />
          <span className="text-sm text-white/70">Enable maintenance mode</span>
        </label>
      </div>

      <button className="btn-primary">Save All Settings</button>
    </div>
  );
}
