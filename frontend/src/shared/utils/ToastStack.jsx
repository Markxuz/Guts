import React from "react";

/**
 * ToastStack - Renders a stack of toast notifications.
 * Props:
 *   - toasts: Array<{ id, message, type }>
 *   - onDismiss: function(id)
 */
export default function ToastStack({ toasts = [], onDismiss }) {
  // Safe check: Kung walang laman o undefined ang toasts, wag mag-render
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button 
              type="button" 
              // Safe check: Siguraduhing may onDismiss function bago tawagin
              onClick={() => onDismiss && onDismiss(toast.id)} 
              className="text-xs font-semibold hover:opacity-70 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}