import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const defaultToastValue = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

export const ToastContext = createContext({
  toast: defaultToastValue,
  addToast: () => {},
  removeToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => {
          let bg = 'bg-white border-outline-variant text-[#1b1c1c]';
          let icon = <Info className="w-5 h-5 text-secondary flex-shrink-0" />;

          if (t.type === 'success') {
            bg = 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]';
            icon = <CheckCircle2 className="w-5 h-5 text-[#16a34a] flex-shrink-0" />;
          } else if (t.type === 'error') {
            bg = 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]';
            icon = <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />;
          } else if (t.type === 'warning') {
            bg = 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]';
            icon = <AlertTriangle className="w-5 h-5 text-[#d97706] flex-shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-warm-md transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-5">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  return context?.toast || defaultToastValue;
};

export default ToastContext;
