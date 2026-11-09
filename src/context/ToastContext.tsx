import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-[#151D30]/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-[#151D30]/95 border-rose-500/40 text-rose-300 shadow-rose-950/40'
                : toast.type === 'warning'
                ? 'bg-[#151D30]/95 border-amber-500/40 text-amber-300 shadow-amber-950/40'
                : 'bg-[#151D30]/95 border-cyan-500/40 text-cyan-300 shadow-cyan-950/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-white">{toast.title}</p>
              {toast.message && <p className="text-gray-300 text-xs mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors shrink-0 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
