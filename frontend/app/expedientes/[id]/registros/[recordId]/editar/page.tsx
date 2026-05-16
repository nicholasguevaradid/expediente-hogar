'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { registrosApi } from '@/services/api';
import type { MedicalRecordBase, MedicalRecordResponse } from '@/types/expediente';
import RegistroForm from '@/components/RegistroForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function EditarRegistroPage() {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<MedicalRecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registrosApi
      .getById(Number(recordId))
      .then(setRecord)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [recordId]);

  async function handleSubmit(data: MedicalRecordBase) {
    await registrosApi.update(Number(recordId), data);
    router.push(`/expedientes/${id}`);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!record) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href={`/expedientes/${id}`} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Volver al expediente
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Editar registro médico</h1>
      </div>
      <p className="text-sm text-gray-500 -mt-4">
        Visita del {record.visitDate?.split('T')[0]} — #{record.medicalRecordId}
      </p>

      <RegistroForm
        patientId={record.patientId}
        initialData={record}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/expedientes/${id}`)}
      />
    </div>
  );
}
