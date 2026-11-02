import { useApp } from '../store/AppContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  };

  const bgColors = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-cyan-500/30 bg-cyan-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast glass flex items-center gap-3 p-4 rounded-xl border ${bgColors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm text-white/90 flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
