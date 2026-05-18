import type { PatientBase, PatientResponse, PatientWithRecordsResponse, MedicalRecordBase, MedicalRecordResponse, PaginatedResult } from '@/types/expediente';

const BASE_URL      = process.env.NEXT_PUBLIC_API_URL      ?? 'http://localhost:5192';
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:5100';

const STORAGE_KEY = 'eh_auth';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

function buildHeaders(options?: RequestInit) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }
    throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error inesperado.' }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(options),
    ...options,
  });
  return handleResponse<T>(res);
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    headers: buildHeaders(options),
    ...options,
  });
  return handleResponse<T>(res);
}

export interface StatsResponse {
  totalPatients: number;
  totalActivo: number;
  totalInactivo: number;
  totalCerrado: number;
  totalPendiente: number;
  nuevosHoy: number;
  totalRecords: number;
  recentPatients: {
    patientId: number;
    numeroExpediente: string | null;
    firstName: string;
    lastName: string;
    estado: string;
    createdAt: string;
  }[];
}

export const statsApi = {
  get(): Promise<StatsResponse> {
    return request('/api/stats');
  },
};

export const expedientesApi = {
  list(search?: string, estado?: string, page = 1, pageSize = 20): Promise<PaginatedResult<PatientResponse>> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return request(`/api/patients?${params.toString()}`);
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

export interface UserListItem {
  userId: number;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const usersApi = {
  list(): Promise<UserListItem[]> {
    return authRequest('/api/users');
  },

  create(data: { username: string; password: string; role: string }): Promise<{ userId: number }> {
    return authRequest('/api/users', { method: 'POST', body: JSON.stringify(data) });
  },

  update(userId: number, data: { role: string; isActive: boolean }): Promise<{ updated: number }> {
    return authRequest(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  changePassword(userId: number, newPassword: string): Promise<{ updated: number }> {
    return authRequest(`/api/users/${userId}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) });
  },
};

export const registrosApi = {
  getById(recordId: number): Promise<MedicalRecordResponse> {
    return request(`/api/records/${recordId}`);
  },

  create(patientId: number, data: MedicalRecordBase): Promise<{ medicalRecordId: number }> {
    return request(`/api/patients/${patientId}/records`, {
      method: 'POST',
      body:   JSON.stringify(data),
    });
  },

  update(recordId: number, data: MedicalRecordBase): Promise<{ updated: number }> {
    return request(`/api/records/${recordId}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(recordId: number): Promise<{ deleted: number }> {
    return request(`/api/records/${recordId}`, { method: 'DELETE' });
  },
};
