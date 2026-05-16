export default function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 text-center max-w-md">
        <p className="text-red-700 font-medium mb-1">Ocurrió un error</p>
        <p className="text-red-600 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
