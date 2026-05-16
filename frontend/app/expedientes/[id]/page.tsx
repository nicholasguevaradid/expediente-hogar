'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { expedientesApi, registrosApi } from '@/services/api';
import type { PatientWithRecordsResponse, MedicalRecordResponse } from '@/types/expediente';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { useIsAdmin } from '@/hooks/useRole';

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

interface RecordCardProps {
  rec: MedicalRecordResponse;
  patientId: string;
  onDelete: (id: number) => void;
  deleting: boolean;
  isAdmin: boolean;
}

function RecordCard({ rec, patientId, onDelete, deleting, isAdmin }: RecordCardProps) {
  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm text-blue-700">
          Visita: {rec.visitDate?.split('T')[0]}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">#{rec.medicalRecordId}</span>
          {isAdmin && (
            <>
              <a
                href={`/expedientes/${patientId}/registros/${rec.medicalRecordId}/editar`}
                className="text-amber-600 hover:underline text-xs font-medium"
              >
                Editar
              </a>
              <button
                onClick={() => onDelete(rec.medicalRecordId)}
                disabled={deleting}
                className="text-red-600 hover:underline text-xs font-medium disabled:opacity-40"
              >
                {deleting ? '...' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="Diagnóstico" value={rec.diagnosis} />
        <Field label="Diagnóstico histórico" value={rec.hist_Diagnosis} />
        <Field label="Alergias" value={rec.alergies} />
        <Field label="Prescripción" value={rec.perscrption} />
        <Field label="Presión arterial" value={rec.bloodPressure} />
        <Field label="Temperatura (°C)" value={rec.temperatureC?.toString()} />
        <Field label="Peso (kg)" value={rec.weightKg?.toString()} />
        <Field label="Altura (cm)" value={rec.heightCm?.toString()} />
      </dl>
      {rec.notes && (
        <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
          <span className="font-medium">Notas: </span>{rec.notes}
        </div>
      )}
    </div>
  );
}

export default function DetalleExpedientePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const isAdmin = useIsAdmin();
  const { toasts, addToast, dismiss } = useToast();

  const [data, setData] = useState<PatientWithRecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirm para eliminar expediente
  const [showExpConfirm, setShowExpConfirm] = useState(false);
  const [deletingExp, setDeletingExp] = useState(false);

  // Confirm para eliminar registro médico
  const [confirmRecordId, setConfirmRecordId] = useState<number | null>(null);
  const [deletingRecord, setDeletingRecord] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    expedientesApi
      .getWithRecords(Number(id))
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleDeleteExpediente() {
    setDeletingExp(true);
    try {
      await expedientesApi.delete(Number(id));
      router.push('/expedientes');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'No se pudo eliminar el expediente.', 'error');
      setDeletingExp(false);
      setShowExpConfirm(false);
    }
  }

  async function handleDeleteRecord() {
    if (confirmRecordId === null) return;
    setDeletingRecord(true);
    try {
      await registrosApi.delete(confirmRecordId);
      setData((prev) =>
        prev
          ? { ...prev, records: prev.records.filter((r) => r.medicalRecordId !== confirmRecordId) }
          : prev
      );
      addToast('Registro médico eliminado.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'No se pudo eliminar el registro.', 'error');
    } finally {
      setDeletingRecord(false);
      setConfirmRecordId(null);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const { patient, records } = data;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <a href="/expedientes" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Volver al listado
            </a>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {patient.lastName}, {patient.firstName}
              {patient.secLastName ? ` ${patient.secLastName}` : ''}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-blue-700 text-sm font-medium">
                {patient.numeroExpediente ?? 'Sin número'}
              </span>
              <StatusBadge estado={patient.estado} />
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <a href={`/expedientes/${id}/editar`} className="btn-secondary">Editar</a>
              <button onClick={() => setShowExpConfirm(true)} className="btn-danger">Eliminar</button>
            </div>
          )}
        </div>

        {/* Datos personales */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">Datos personales</h2>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Identificación" value={patient.identificacion} />
            <Field label="Fecha de nacimiento" value={patient.birth_Date?.split('T')[0]} />
            <Field label="Género" value={patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : patient.gender} />
            <Field label="Teléfono" value={patient.phoneNum} />
            <Field label="Correo" value={patient.email} />
            <Field label="Cantón" value={patient.canton} />
            <Field label="Dirección" value={patient.addressLine1} />
            <Field label="Dirección (línea 2)" value={patient.addressLine2} />
            <Field label="Tipo de casa" value={patient.tipoCasa} />
            <Field label="Teléfono de emergencia" value={patient.emergencyNum} />
            <Field label="Contacto de emergencia" value={patient.emergencyName} />
          </dl>
          {patient.observaciones && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">{patient.observaciones}</dd>
            </div>
          )}
        </div>

        {/* Fechas */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">Información del registro</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Fecha de registro" value={new Date(patient.createdAt).toLocaleString('es-CR')} />
            <Field label="Última actualización" value={new Date(patient.updatedAt).toLocaleString('es-CR')} />
          </dl>
        </div>

        {/* Registros médicos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Registros médicos ({records.length})
            </h2>
            {isAdmin && (
              <a href={`/expedientes/${id}/registros/nuevo`} className="btn-primary text-sm">
                + Agregar registro
              </a>
            )}
          </div>
          {records.length === 0 ? (
            <div className="card text-center text-gray-400 py-10">
              No hay registros médicos para este expediente.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((rec) => (
                <RecordCard
                  key={rec.medicalRecordId}
                  rec={rec}
                  patientId={id}
                  onDelete={setConfirmRecordId}
                  deleting={deletingRecord && confirmRecordId === rec.medicalRecordId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showExpConfirm && (
        <ConfirmDialog
          message="¿Eliminar este expediente y todos sus registros? Esta acción no se puede deshacer."
          onConfirm={handleDeleteExpediente}
          onCancel={() => setShowExpConfirm(false)}
          loading={deletingExp}
        />
      )}

      {confirmRecordId !== null && (
        <ConfirmDialog
          message="¿Eliminar este registro médico? Esta acción no se puede deshacer."
          onConfirm={handleDeleteRecord}
          onCancel={() => setConfirmRecordId(null)}
          loading={deletingRecord}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
