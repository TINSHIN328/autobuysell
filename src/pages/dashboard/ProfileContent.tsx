import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Gamepad2, Save } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function ProfileContent() {
  const { user } = useApp();
  const [mcUsername, setMcUsername] = useState(user?.minecraftUsername || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Profile Settings</h2>
        <p className="text-white/50">Manage your account information</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{user?.username}</h3>
            <p className="text-sm text-white/40">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
            <User className="w-4 h-4" /> Username
          </label>
          <input type="text" value={user?.username || ''} className="input-field" disabled />
        </div>

        <div>
          <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </label>
          <input type="email" value={user?.email || ''} className="input-field" disabled />
        </div>

        <div>
          <label className="text-sm text-white/70 mb-2 block flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Minecraft Username
          </label>
          <input
            type="text"
            value={mcUsername}
            onChange={e => setMcUsername(e.target.value)}
            className="input-field"
            placeholder="Enter your Minecraft username"
          />
          <p className="text-xs text-white/30 mt-1">This is where your purchases will be delivered</p>
        </div>

        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-2 block">Current Password</label>
            <input type="password" className="input-field" placeholder="Enter current password" />
          </div>
          <div>
            <label className="text-sm text-white/70 mb-2 block">New Password</label>
            <input type="password" className="input-field" placeholder="Enter new password" />
          </div>
          <button className="btn-primary text-sm">Update Password</button>
        </div>
      </motion.div>
    </div>
  );
}
