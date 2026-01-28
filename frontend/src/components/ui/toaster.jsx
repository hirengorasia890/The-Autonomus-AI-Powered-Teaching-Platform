import React from "react";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-[9999]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl shadow-md transition-all ${
            toast.variant === "destructive"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {toast.title && <h4 className="font-semibold">{toast.title}</h4>}
          {toast.description && (
            <p className="text-sm mt-1">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
