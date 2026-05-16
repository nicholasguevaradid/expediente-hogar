'use client';

import { useEffect, useState } from 'react';
import { statsApi, type StatsResponse } from '@/services/api';
import { useIsAdmin } from '@/hooks/useRole';
import StatusBadge from '@/components/StatusBadge';

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`card border-l-4 ${color}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const isAdmin = useIsAdmin();
  const [stats, setStats]     = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen del sistema</p>
        </div>
        {isAdmin && (
          <a href="/expedientes/nuevo" className="btn-primary">+ Nuevo expediente</a>
        )}
      </div>

      {/* Tarjetas principales */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card border-l-4 border-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card text-sm text-red-600">No se pudieron cargar las estadísticas.</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total expedientes"
              value={stats.totalPatients}
              sub={`${stats.nuevosHoy} nuevo${stats.nuevosHoy !== 1 ? 's' : ''} hoy`}
              color="border-blue-500"
            />
            <StatCard
              label="Registros médicos"
              value={stats.totalRecords}
              color="border-purple-500"
            />
            <StatCard
              label="Activos"
              value={stats.totalActivo}
              sub={stats.totalPatients > 0
                ? `${Math.round((stats.totalActivo / stats.totalPatients) * 100)}% del total`
                : undefined}
              color="border-green-500"
            />
            <StatCard
              label="Pendientes"
              value={stats.totalPendiente}
              color="border-yellow-500"
            />
          </div>

          {/* Breakdown por estado */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribución por estado</h2>
            <div className="space-y-3">
              {[
                { label: 'Activo',    value: stats.totalActivo,    total: stats.totalPatients, color: 'bg-green-500' },
                { label: 'Pendiente', value: stats.totalPendiente, total: stats.totalPatients, color: 'bg-yellow-400' },
                { label: 'Inactivo',  value: stats.totalInactivo,  total: stats.totalPatients, color: 'bg-gray-400' },
                { label: 'Cerrado',   value: stats.totalCerrado,   total: stats.totalPatients, color: 'bg-red-400' },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-800">{value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimos expedientes */}
          {stats.recentPatients.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Últimos expedientes registrados</h2>
                <a href="/expedientes" className="text-xs text-blue-600 hover:underline">Ver todos →</a>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.recentPatients.map((p) => (
                  <a
                    key={p.patientId}
                    href={`/expedientes/${p.patientId}`}
                    className="flex items-center justify-between py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.lastName}, {p.firstName}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{p.numeroExpediente ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge estado={p.estado} />
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {new Date(p.createdAt).toLocaleDateString('es-CR')}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Búsqueda rápida */}
      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">Búsqueda rápida</h3>
        <form action="/expedientes" className="flex gap-2">
          <input
            name="search"
            placeholder="Buscar por nombre, cédula o número de expediente..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>
    </div>
  );
}
