'use client';

import { useRouter } from 'next/navigation';
import { expedientesApi } from '@/services/api';
import type { PatientBase } from '@/types/expediente';
import ExpedienteForm from '@/components/ExpedienteForm';

export default function NuevoExpedientePage() {
  const router = useRouter();

  async function handleSubmit(data: PatientBase) {
    const { patientId } = await expedientesApi.create(data);
    router.push(`/expedientes/${patientId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/expedientes" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Volver
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo expediente</h1>
      </div>

      <ExpedienteForm
        submitLabel="Crear expediente"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/expedientes')}
      />
    </div>
  );
}
