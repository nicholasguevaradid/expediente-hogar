'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

const styles: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-blue-600 text-white',
};

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export default function Toast({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-64 max-w-sm ${styles[toast.type]}`}
    >
      <span className="flex-1">{toast.text}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100 text-lg leading-none">
        ×
      </button>
    </div>
  );
}
