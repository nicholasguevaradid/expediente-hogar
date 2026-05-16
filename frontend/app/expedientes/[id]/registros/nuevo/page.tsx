'use client';

import { useParams, useRouter } from 'next/navigation';
import { registrosApi } from '@/services/api';
import type { MedicalRecordBase } from '@/types/expediente';
import RegistroForm from '@/components/RegistroForm';

export default function NuevoRegistroPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const patientId = Number(id);

  async function handleSubmit(data: MedicalRecordBase) {
    await registrosApi.create(patientId, data);
    router.push(`/expedientes/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href={`/expedientes/${id}`} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Volver al expediente
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo registro médico</h1>
      </div>

      <RegistroForm
        patientId={patientId}
        submitLabel="Guardar registro"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/expedientes/${id}`)}
      />
    </div>
  );
}
