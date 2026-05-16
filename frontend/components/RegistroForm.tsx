'use client';

import { useState } from 'react';
import type { MedicalRecordBase } from '@/types/expediente';

interface Props {
  patientId: number;
  initialData?: Partial<MedicalRecordBase>;
  onSubmit: (data: MedicalRecordBase) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}

const empty = (patientId: number): MedicalRecordBase => ({
  patientId,
  visitDate: new Date().toISOString().split('T')[0],
  legalName: '',
  hist_Diagnosis: '',
  diagnosis: '',
  alergies: '',
  perscrption: '',
  notes: '',
  heightCm: undefined,
  weightKg: undefined,
  bloodPressure: '',
  temperatureC: undefined,
});

export default function RegistroForm({ patientId, initialData, onSubmit, submitLabel, onCancel }: Props) {
  const [form, setForm] = useState<MedicalRecordBase>({ ...empty(patientId), ...initialData });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStr = (field: keyof MedicalRecordBase) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setNum = (field: keyof MedicalRecordBase) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value === '' ? undefined : Number(e.target.value) }));

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Datos de la visita</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha de visita *</label>
            <input required type="date" className="input-field" value={form.visitDate} onChange={setStr('visitDate')} />
          </div>
          <div>
            <label className="label">Nombre legal</label>
            <input className="input-field" value={form.legalName ?? ''} onChange={setStr('legalName')} />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Diagnóstico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Diagnóstico actual</label>
            <input className="input-field" value={form.diagnosis ?? ''} onChange={setStr('diagnosis')} />
          </div>
          <div>
            <label className="label">Diagnóstico histórico</label>
            <input className="input-field" value={form.hist_Diagnosis ?? ''} onChange={setStr('hist_Diagnosis')} />
          </div>
          <div>
            <label className="label">Alergias</label>
            <input className="input-field" value={form.alergies ?? ''} onChange={setStr('alergies')} />
          </div>
          <div>
            <label className="label">Prescripción</label>
            <input className="input-field" value={form.perscrption ?? ''} onChange={setStr('perscrption')} />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Signos vitales</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Presión arterial</label>
            <input className="input-field" placeholder="120/80" value={form.bloodPressure ?? ''} onChange={setStr('bloodPressure')} />
          </div>
          <div>
            <label className="label">Temperatura (°C)</label>
            <input type="number" step="0.1" min="25" max="45" className="input-field" value={form.temperatureC ?? ''} onChange={setNum('temperatureC')} />
          </div>
          <div>
            <label className="label">Peso (kg)</label>
            <input type="number" step="0.1" min="0" max="500" className="input-field" value={form.weightKg ?? ''} onChange={setNum('weightKg')} />
          </div>
          <div>
            <label className="label">Altura (cm)</label>
            <input type="number" step="0.1" min="0" max="300" className="input-field" value={form.heightCm ?? ''} onChange={setNum('heightCm')} />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Notas</h2>
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder="Observaciones adicionales..."
          value={form.notes ?? ''}
          onChange={setStr('notes')}
        />
      </section>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
