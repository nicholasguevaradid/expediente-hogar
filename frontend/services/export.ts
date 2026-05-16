const BASE_URL    = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5192';
const STORAGE_KEY = 'eh_auth';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw)?.token ?? null : null;
  } catch {
    return null;
  }
}

export async function downloadExport(path: string, filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }

  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

export function exportPdf(patientId: number, numeroExpediente?: string | null) {
  const filename = `expediente-${numeroExpediente ?? patientId}.pdf`;
  return downloadExport(`/api/patients/${patientId}/export/pdf`, filename);
}

export function exportExcel(search?: string, estado?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (estado) params.set('estado', estado);
  const qs = params.toString();
  return downloadExport(`/api/patients/export/excel${qs ? '?' + qs : ''}`, 'expedientes.xlsx');
}
