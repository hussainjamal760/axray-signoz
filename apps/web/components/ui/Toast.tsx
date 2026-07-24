"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "info" | "error" | "success" | "warning";
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; type?: ToastMessage["type"] }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ title, description, type = "info" }: { title: string; description?: string; type?: ToastMessage["type"] }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Radical Brutalist Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 border-[3px] border-outline brutalist-shadow font-mono-label flex items-start justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200 ${
              t.type === "error"
                ? "bg-surface text-error border-error"
                : t.type === "success"
                ? "bg-surface text-emerald-400 border-emerald-400"
                : t.type === "warning"
                ? "bg-surface text-amber-400 border-amber-400"
                : "bg-surface text-primary-fixed border-primary-fixed"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
                {t.type === "error" ? "error" : t.type === "success" ? "check_circle" : t.type === "warning" ? "warning" : "info"}
              </span>
              <div>
                <h4 className="font-black uppercase text-xs tracking-wide">{t.title}</h4>
                {t.description && <p className="text-[11px] text-on-surface-variant mt-1">{t.description}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
