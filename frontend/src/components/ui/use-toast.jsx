import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastProvider, ToastViewport } from "@radix-ui/react-toast";

const ToastContext = createContext({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProviderWrapper({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 3000 }) => {
      const id = Date.now();
      setToasts((prev) => [
        ...prev,
        { id, title, description, variant, duration },
      ]);

      setTimeout(() => dismiss(id), duration);
    },
    []
  );

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
