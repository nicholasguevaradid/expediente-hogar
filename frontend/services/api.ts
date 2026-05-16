import type { PatientBase, PatientResponse, PatientWithRecordsResponse, MedicalRecordBase, MedicalRecordResponse } from '@/types/expediente';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5192';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error inesperado.' }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const expedientesApi = {
  list(search?: string, estado?: string): Promise<PatientResponse[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (estado) params.set('estado', estado);
    const qs = params.toString();
    return request(`/api/patients${qs ? `?${qs}` : ''}`);
  },

  getById(id: number): Promise<PatientResponse> {
    return request(`/api/patients/${id}`);
  },

  getWithRecords(id: number): Promise<PatientWithRecordsResponse> {
    return request(`/api/patients/${id}/records`);
  },

  create(data: PatientBase): Promise<{ patientId: number }> {
    return request('/api/patients', { method: 'POST', body: JSON.stringify(data) });
  },

  update(id: number, data: PatientBase): Promise<{ updated: number }> {
    return request(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(id: number): Promise<{ deleted: number }> {
    return request(`/api/patients/${id}`, { method: 'DELETE' });
  },
};

export const registrosApi = {
  getById(recordId: number): Promise<MedicalRecordResponse> {
    return request(`/api/records/${recordId}`);
  },

  create(patientId: number, data: MedicalRecordBase): Promise<{ medicalRecordId: number }> {
    return request(`/api/patients/${patientId}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(recordId: number, data: MedicalRecordBase): Promise<{ updated: number }> {
    return request(`/api/records/${recordId}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(recordId: number): Promise<{ deleted: number }> {
    return request(`/api/records/${recordId}`, { method: 'DELETE' });
  },
};
