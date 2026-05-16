const colors: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Inactivo: 'bg-gray-100 text-gray-700',
  Cerrado: 'bg-red-100 text-red-800',
  Pendiente: 'bg-yellow-100 text-yellow-800',
};

export default function StatusBadge({ estado }: { estado: string }) {
  const cls = colors[estado] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {estado}
    </span>
  );
}
