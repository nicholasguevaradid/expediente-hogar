'use client';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Eliminar', loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <p className="text-gray-800 font-medium">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={loading} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
