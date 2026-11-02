import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Bot, ArrowRight, Star, Bitcoin, Gamepad2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function Landing() {
  const { isAuthenticated } = useApp();

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">ZYRO STORE</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70">Live & Operational</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Premium Minecraft</span>
              <br />
              <span className="gradient-text">Marketplace</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Purchase Minecraft coins, items, and services with Litecoin. 
              Instant delivery powered by our automated bot system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/store" : "/register"} className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-xl border border-white/10 text-white/80 hover:border-purple-500/50 hover:text-white transition-all inline-flex items-center justify-center gap-2">
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { label: 'Orders Completed', value: '12,847' },
              { label: 'LTC Processed', value: '847.3' },
              { label: 'Active Users', value: '3,291' },
              { label: 'Avg. Delivery', value: '< 2 min' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose ZYRO STORE?</h2>
            <p className="text-white/50 max-w-xl mx-auto">Built with security, speed, and reliability in mind</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Bitcoin className="w-6 h-6" />, title: 'Litecoin Payments', desc: 'Fast, low-fee cryptocurrency payments with blockchain verification' },
              { icon: <Bot className="w-6 h-6" />, title: 'Auto Delivery', desc: 'Automated Minecraft bot delivers your purchase within minutes' },
              { icon: <Shield className="w-6 h-6" />, title: 'Secure & Safe', desc: 'Bank-level security with encrypted transactions and data protection' },
              { icon: <Clock className="w-6 h-6" />, title: '24/7 Available', desc: 'Our automated systems work around the clock, no downtime' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/50">Simple 4-step process</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Product', desc: 'Browse our catalog and select what you need' },
              { step: '02', title: 'Enter MC Username', desc: 'Provide your Minecraft username for delivery' },
              { step: '03', title: 'Pay with LTC', desc: 'Send Litecoin to the provided address' },
              { step: '04', title: 'Auto Delivery', desc: 'Bot delivers items to your account instantly' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-4xl font-bold gradient-text mb-3">{item.step}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Alex_MC', text: 'Got my coins in under 2 minutes. Amazing service!', rating: 5 },
              { name: 'DiamondKing', text: 'Best Minecraft store I\'ve used. The LTC payment is so fast.', rating: 5 },
              { name: 'ProGamer2024', text: 'Reliable and professional. The bot delivery is impressive.', rating: 5 },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm mb-4">"{review.text}"</p>
                <p className="text-white font-semibold text-sm">@{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ZYRO STORE</span>
          </div>
          <p className="text-white/40 text-sm">© 2024 ZYRO STORE. All rights reserved. Not affiliated with Mojang.</p>
          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
