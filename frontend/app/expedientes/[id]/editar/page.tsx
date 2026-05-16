'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { expedientesApi } from '@/services/api';
import type { PatientBase, PatientResponse } from '@/types/expediente';
import ExpedienteForm from '@/components/ExpedienteForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function EditarExpedientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    expedientesApi
      .getById(Number(id))
      .then(setPatient)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: PatientBase) {
    await expedientesApi.update(Number(id), data);
    router.push(`/expedientes/${id}`);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!patient) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href={`/expedientes/${id}`} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Volver al detalle
        </a>
        <h1 className="text-2xl font-bold text-gray-900">
          Editar: {patient.lastName}, {patient.firstName}
        </h1>
      </div>

      {patient.numeroExpediente && (
        <p className="text-sm text-blue-700 font-mono font-medium -mt-2">
          {patient.numeroExpediente}
        </p>
      )}

      <ExpedienteForm
        initialData={patient}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/expedientes/${id}`)}
      />
    </div>
  );
}
