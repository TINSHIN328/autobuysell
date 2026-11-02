import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function StoreContent() {
  const { products, createOrder, user } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [mcUsername, setMcUsername] = useState(user?.minecraftUsername || '');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory && p.enabled && p.inStock;
  });

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'coins', label: 'Coins' },
    { id: 'items', label: 'Items' },
    { id: 'services', label: 'Services' },
  ];

  const handlePurchase = (productId: string) => {
    if (!mcUsername.trim()) return;
    const order = createOrder(productId, mcUsername.trim());
    setSelectedProduct(null);
    navigate(`/payment/${order.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Product Store</h2>
        <p className="text-white/50">Browse and purchase Minecraft products with Litecoin</p>
      </div>

      {/* MC Username */}
      <div className="glass-card p-4">
        <label className="text-sm text-white/70 mb-2 block">Your Minecraft Username</label>
        <input
          type="text"
          value={mcUsername}
          onChange={e => setMcUsername(e.target.value)}
          className="input-field"
          placeholder="Enter your Minecraft username for delivery"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search products..."
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 flex flex-col"
          >
            <div className="text-4xl mb-4 text-center py-4 bg-white/5 rounded-xl">
              {product.image}
            </div>
            <h3 className="font-semibold text-white mb-1">{product.name}</h3>
            <p className="text-sm text-white/50 flex-1 mb-4">{product.description}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold gradient-text">{product.priceLTC} LTC</p>
                <p className="text-xs text-white/40">Delivery: {product.deliveryAmount}</p>
              </div>
              <span className="status-badge status-delivered text-xs">In Stock</span>
            </div>
            <button
              onClick={() => setSelectedProduct(product.id)}
              disabled={!mcUsername.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Purchase
            </button>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No products found</p>
        </div>
      )}

      {/* Purchase Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const product = products.find(p => p.id === selectedProduct);
              if (!product) return null;
              return (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Purchase</h3>
                  <p className="text-white/50 text-sm mb-6">Review your order details</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/60 text-sm">Product</span>
                      <span className="text-white text-sm font-medium">{product.name}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/60 text-sm">MC Username</span>
                      <span className="text-white text-sm font-medium">{mcUsername}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/60 text-sm">Amount</span>
                      <span className="text-white text-sm font-medium">{product.priceLTC} LTC</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <span className="text-purple-300 text-sm">Delivery</span>
                      <span className="text-purple-300 text-sm font-medium">{product.deliveryAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setSelectedProduct(null)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white transition-colors text-sm">
                      Cancel
                    </button>
                    <button onClick={() => handlePurchase(selectedProduct)} className="flex-1 btn-primary text-sm">
                      Confirm & Pay
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
