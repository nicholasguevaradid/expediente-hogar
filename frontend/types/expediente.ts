export interface PatientBase {
  identificacion?: string;
  firstName: string;
  lastName: string;
  secLastName?: string;
  birth_Date?: string;
  gender?: string;
  phoneNum?: string;
  emergencyNum?: string;
  emergencyName?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  canton?: string;
  tipoCasa?: string;
  estado: string;
  observaciones?: string;
}

export interface PatientResponse extends PatientBase {
  patientId: number;
  numeroExpediente?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordBase {
  patientId: number;
  visitDate: string;
  legalName?: string;
  hist_Diagnosis?: string;
  diagnosis?: string;
  alergies?: string;
  perscrption?: string;
  notes?: string;
  heightCm?: number;
  weightKg?: number;
  bloodPressure?: string;
  temperatureC?: number;
}

export interface MedicalRecordResponse extends MedicalRecordBase {
  medicalRecordId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatientWithRecordsResponse {
  patient: PatientResponse;
  records: MedicalRecordResponse[];
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

export const ESTADOS = ['Activo', 'Inactivo', 'Cerrado', 'Pendiente'] as const;
export type Estado = (typeof ESTADOS)[number];

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
