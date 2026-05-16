'use client';

import { useState } from 'react';
import type { PatientBase } from '@/types/expediente';
import { ESTADOS } from '@/types/expediente';

interface Props {
  initialData?: Partial<PatientBase>;
  onSubmit: (data: PatientBase) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}

const empty: PatientBase = {
  identificacion: '',
  firstName: '',
  lastName: '',
  secLastName: '',
  birth_Date: '',
  gender: '',
  phoneNum: '',
  emergencyNum: '',
  emergencyName: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  canton: '',
  tipoCasa: '',
  estado: 'Activo',
  observaciones: '',
};

export default function ExpedienteForm({ initialData, onSubmit, submitLabel, onCancel }: Props) {
  const [form, setForm] = useState<PatientBase>({ ...empty, ...initialData });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof PatientBase) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Datos personales */}
      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Datos personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Primer nombre *</label>
            <input required className="input-field" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div>
            <label className="label">Primer apellido *</label>
            <input required className="input-field" value={form.lastName} onChange={set('lastName')} />
          </div>
          <div>
            <label className="label">Segundo apellido</label>
            <input className="input-field" value={form.secLastName ?? ''} onChange={set('secLastName')} />
          </div>
          <div>
            <label className="label">Identificación (cédula)</label>
            <input className="input-field" value={form.identificacion ?? ''} onChange={set('identificacion')} />
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input type="date" className="input-field" value={form.birth_Date ?? ''} onChange={set('birth_Date')} />
          </div>
          <div>
            <label className="label">Género</label>
            <select className="input-field" value={form.gender ?? ''} onChange={set('gender')}>
              <option value="">— Seleccionar —</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Teléfono</label>
            <input type="tel" className="input-field" value={form.phoneNum ?? ''} onChange={set('phoneNum')} />
          </div>
          <div>
            <label className="label">Correo electrónico</label>
            <input type="email" className="input-field" value={form.email ?? ''} onChange={set('email')} />
          </div>
          <div>
            <label className="label">Teléfono de emergencia</label>
            <input type="tel" className="input-field" value={form.emergencyNum ?? ''} onChange={set('emergencyNum')} />
          </div>
          <div>
            <label className="label">Nombre de contacto de emergencia</label>
            <input className="input-field" value={form.emergencyName ?? ''} onChange={set('emergencyName')} />
          </div>
        </div>
      </section>

      {/* Dirección */}
      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Dirección</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Dirección (línea 1)</label>
            <input className="input-field" value={form.addressLine1 ?? ''} onChange={set('addressLine1')} />
          </div>
          <div>
            <label className="label">Dirección (línea 2)</label>
            <input className="input-field" value={form.addressLine2 ?? ''} onChange={set('addressLine2')} />
          </div>
          <div>
            <label className="label">Cantón</label>
            <input className="input-field" value={form.canton ?? ''} onChange={set('canton')} />
          </div>
          <div>
            <label className="label">Tipo de casa</label>
            <input className="input-field" value={form.tipoCasa ?? ''} onChange={set('tipoCasa')} />
          </div>
        </div>
      </section>

      {/* Estado y observaciones */}
      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Estado del expediente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Estado *</label>
            <select required className="input-field" value={form.estado} onChange={set('estado')}>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Observaciones</label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            value={form.observaciones ?? ''}
            onChange={set('observaciones')}
          />
        </div>
      </section>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
