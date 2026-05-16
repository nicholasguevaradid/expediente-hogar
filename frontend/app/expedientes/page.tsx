'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { expedientesApi } from '@/services/api';
import type { PatientResponse, PaginatedResult } from '@/types/expediente';
import { ESTADOS } from '@/types/expediente';
import ExpedienteTable from '@/components/ExpedienteTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import { useToast } from '@/hooks/useToast';
import { useIsAdmin } from '@/hooks/useRole';
import { exportExcel } from '@/services/export';

const PAGE_SIZE = 20;

function ExpedientesContent() {
  const searchParams = useSearchParams();
  const router     = useRouter();
  const isAdmin    = useIsAdmin();
  const [exporting, setExporting] = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  const search = searchParams.get('search') ?? '';
  const estado = searchParams.get('estado') ?? '';
  const page   = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(search);
  const [estadoInput, setEstadoInput] = useState(estado);

  const [result, setResult]   = useState<PaginatedResult<PatientResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<number | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expedientesApi.list(search || undefined, estado || undefined, page, PAGE_SIZE);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar expedientes.');
    } finally {
      setLoading(false);
    }
  }, [search, estado, page]);

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
    params.set('page', '1');
    router.push(`/expedientes?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/expedientes?${params.toString()}`);
  }

  async function handleDeleteConfirm() {
    if (confirmId === null) return;
    setDeleting(true);
    try {
      await expedientesApi.delete(confirmId);
      addToast('Expediente eliminado correctamente.', 'success');
      fetchData();
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
            {result && (
              <p className="text-gray-500 text-sm mt-1">
                {result.total} resultado{result.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setExporting(true);
                try { await exportExcel(search || undefined, estado || undefined); }
                catch { addToast('No se pudo generar el Excel.', 'error'); }
                finally { setExporting(false); }
              }}
              disabled={exporting}
              className="btn-secondary disabled:opacity-60"
            >
              {exporting ? 'Generando…' : 'Exportar Excel'}
            </button>
            {isAdmin && (
              <a href="/expedientes/nuevo" className="btn-primary">+ Nuevo expediente</a>
            )}
          </div>
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

        {!loading && !error && result && (
          <>
            <ExpedienteTable
              expedientes={result.data}
              onDelete={setConfirmId}
              deleting={confirmId}
            />
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              pageSize={result.pageSize}
              onPageChange={goToPage}
            />
          </>
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
