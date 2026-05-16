'use client';

import { useRouter } from 'next/navigation';
import type { PatientResponse } from '@/types/expediente';
import StatusBadge from './StatusBadge';

interface Props {
  expedientes: PatientResponse[];
  onDelete?: (id: number) => void;
  deleting?: number | null;
}

export default function ExpedienteTable({ expedientes, onDelete, deleting }: Props) {
  const router = useRouter();

  if (expedientes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No se encontraron expedientes.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Expediente</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Identificación</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {expedientes.map((exp) => (
            <tr
              key={exp.patientId}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/expedientes/${exp.patientId}`)}
            >
              <td className="px-4 py-3 font-mono text-blue-700 font-medium">
                {exp.numeroExpediente ?? '—'}
              </td>
              <td className="px-4 py-3 font-medium">
                {exp.lastName}, {exp.firstName}
                {exp.secLastName ? ` ${exp.secLastName}` : ''}
              </td>
              <td className="px-4 py-3 text-gray-600">{exp.identificacion ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{exp.phoneNum ?? '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge estado={exp.estado} />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/expedientes/${exp.patientId}`)}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => router.push(`/expedientes/${exp.patientId}/editar`)}
                    className="text-amber-600 hover:underline text-xs font-medium"
                  >
                    Editar
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(exp.patientId)}
                      disabled={deleting === exp.patientId}
                      className="text-red-600 hover:underline text-xs font-medium disabled:opacity-40"
                    >
                      {deleting === exp.patientId ? '...' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
