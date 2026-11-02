import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, ClipboardList, CreditCard, Gamepad2, HelpCircle, UserCog, Settings, LogOut, Zap, Menu, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { DashboardContent } from './dashboard/DashboardContent';
import { StoreContent } from './dashboard/StoreContent';
import { OrdersContent } from './dashboard/OrdersContent';
import { SupportContent } from './dashboard/SupportContent';
import { ProfileContent } from './dashboard/ProfileContent';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'store', label: 'Buy Products', icon: ShoppingBag },
  { id: 'orders', label: 'My Orders', icon: ClipboardList },
  { id: 'support', label: 'Support', icon: HelpCircle },
  { id: 'profile', label: 'Profile', icon: UserCog },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardContent />;
      case 'store': return <StoreContent />;
      case 'orders': return <OrdersContent />;
      case 'support': return <SupportContent />;
      case 'profile': return <ProfileContent />;
      default: return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">ZYRO STORE</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`sidebar-item w-full flex items-center gap-3 text-sm ${activeTab === item.id ? 'active text-white' : 'text-white/60 hover:text-white'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {user?.role === 'admin' && (
          <div className="px-4 pb-2">
            <a href="/admin" className="sidebar-item flex items-center gap-3 text-sm text-amber-400 hover:text-amber-300">
              <Settings className="w-4 h-4" />
              Admin Panel
            </a>
          </div>
        )}

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-item w-full flex items-center gap-3 text-sm text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/70">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white capitalize">
            {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-white/30" />
          </div>
        </header>

        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
