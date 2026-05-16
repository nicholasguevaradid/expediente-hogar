'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { expedientesApi } from '@/services/api';
import type { PatientResponse } from '@/types/expediente';
import { ESTADOS } from '@/types/expediente';
import ExpedienteTable from '@/components/ExpedienteTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';

function ExpedientesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  const [expedientes, setExpedientes] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const search = searchParams.get('search') ?? '';
  const estado = searchParams.get('estado') ?? '';
  const [searchInput, setSearchInput] = useState(search);
  const [estadoInput, setEstadoInput] = useState(estado);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expedientesApi.list(search || undefined, estado || undefined);
      setExpedientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar expedientes.');
    } finally {
      setLoading(false);
    }
  }, [search, estado]);

  useEffect(() => {
    setSearchInput(search);
    setEstadoInput(estado);
  }, [search, estado]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    if (estadoInput) params.set('estado', estadoInput);
    router.push(`/expedientes?${params.toString()}`);
  }

  async function handleDeleteConfirm() {
    if (confirmId === null) return;
    setDeleting(true);
    try {
      await expedientesApi.delete(confirmId);
      setExpedientes((prev) => prev.filter((e) => e.patientId !== confirmId));
      addToast('Expediente eliminado correctamente.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'No se pudo eliminar el expediente.', 'error');
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-1">
                {expedientes.length} resultado{expedientes.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <a href="/expedientes/nuevo" className="btn-primary">
            + Nuevo expediente
          </a>
        </div>

        <form onSubmit={applyFilters} className="card flex flex-col sm:flex-row gap-3">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, cédula, expediente..."
            className="input-field flex-1"
          />
          <select
            value={estadoInput}
            onChange={(e) => setEstadoInput(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button type="submit" className="btn-primary">Buscar</button>
          {(search || estado) && (
            <a href="/expedientes" className="btn-secondary text-center">Limpiar</a>
          )}
        </form>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={fetchData} />}
        {!loading && !error && (
          <ExpedienteTable
            expedientes={expedientes}
            onDelete={setConfirmId}
            deleting={confirmId}
          />
        )}
      </div>

      {confirmId !== null && (
        <ConfirmDialog
          message="¿Eliminar este expediente? Esta acción no se puede deshacer."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
          loading={deleting}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

export default function ExpedientesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExpedientesContent />
    </Suspense>
  );
}
