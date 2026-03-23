"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastOptions {
  variant?: ToastType;
  title?: string;
  description?: string;
}

interface ToastContextValue {
  toast: (messageOrOptions: string | ToastOptions, type?: ToastType) => void;
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (messageOrOptions: string | ToastOptions, type: ToastType = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      let message: string;
      let toastType: ToastType;

      if (typeof messageOrOptions === "string") {
        message = messageOrOptions;
        toastType = type;
      } else {
        // 객체 형태 지원: { variant, title, description }
        const { variant = "info", title, description } = messageOrOptions;
        message = description || title || "";
        toastType = variant;
      }

      setToasts((prev) => [...prev, { id, message, type: toastType }]);

      // 3초 후 자동 제거
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  const value: ToastContextValue = {
    toast: addToast,
    showToast: (message, type = "info") => addToast(message, type),
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    info: (message) => addToast(message, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const icons = {
    success: <CheckCircle size={18} className="text-teal" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-navy" />,
  };

  const backgrounds = {
    success: "bg-white border-teal",
    error: "bg-white border-red-500",
    info: "bg-white border-navy",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 border-[1.5px] ${backgrounds[toast.type]} bg-white min-w-[280px] max-w-[400px] shadow-none`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-[14px] font-medium text-ink">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-muted hover:text-ink transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
