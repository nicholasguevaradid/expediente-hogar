'use client';

import { useAuth } from '@/context/AuthContext';

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'Admin';
}

export function useIsProfesional() {
  const { user } = useAuth();
  return user?.role === 'Profesional';
}

export function useCanManageRecords() {
  const { user } = useAuth();
  return user?.role === 'Admin' || user?.role === 'Profesional';
}
