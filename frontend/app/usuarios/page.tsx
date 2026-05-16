'use client';

import { useEffect, useState, useCallback } from 'react';
import { usersApi, type UserListItem } from '@/services/api';
import { useIsAdmin } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';

const ROLES = ['Admin', 'Viewer'] as const;

function RoleBadge({ role }: { role: string }) {
  const cls = role === 'Admin'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {role}
    </span>
  );
}

interface EditRowProps {
  user: UserListItem;
  onSave: (userId: number, role: string, isActive: boolean) => Promise<void>;
  onPassword: (userId: number) => void;
  saving: boolean;
}

function EditRow({ user, onSave, onPassword, saving }: EditRowProps) {
  const [role, setRole]       = useState(user.role);
  const [active, setActive]   = useState(user.isActive);
  const dirty = role !== user.role || active !== user.isActive;

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3 font-medium text-sm">{user.username}</td>
      <td className="px-4 py-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field py-1 text-sm"
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </td>
      <td className="px-4 py-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-gray-700">{active ? 'Activo' : 'Inactivo'}</span>
        </label>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('es-CR')}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {dirty && (
            <button
              onClick={() => onSave(user.userId, role, active)}
              disabled={saving}
              className="btn-primary text-xs py-1 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          )}
          <button
            onClick={() => onPassword(user.userId)}
            className="btn-secondary text-xs py-1"
          >
            Contraseña
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function UsuariosPage() {
  const isAdmin = useIsAdmin();
  const router  = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  const [users, setUsers]         = useState<UserListItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [savingId, setSavingId]   = useState<number | null>(null);

  // Nueva contraseña modal
  const [pwdUserId, setPwdUserId]     = useState<number | null>(null);
  const [newPwd, setNewPwd]           = useState('');
  const [savingPwd, setSavingPwd]     = useState(false);

  // Nuevo usuario form
  const [showCreate, setShowCreate]   = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole]         = useState<'Admin' | 'Viewer'>('Viewer');
  const [creating, setCreating]       = useState(false);

  useEffect(() => {
    if (!isAdmin) { router.replace('/expedientes'); return; }
  }, [isAdmin, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(userId: number, role: string, isActive: boolean) {
    setSavingId(userId);
    try {
      await usersApi.update(userId, { role, isActive });
      setUsers((prev) => prev.map((u) => u.userId === userId ? { ...u, role, isActive } : u));
      addToast('Usuario actualizado.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al actualizar usuario.', 'error');
    } finally {
      setSavingId(null);
    }
  }

  async function handleChangePassword() {
    if (pwdUserId === null || !newPwd) return;
    setSavingPwd(true);
    try {
      await usersApi.changePassword(pwdUserId, newPwd);
      addToast('Contraseña actualizada.', 'success');
      setPwdUserId(null);
      setNewPwd('');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cambiar contraseña.', 'error');
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await usersApi.create({ username: newUsername, password: newPassword, role: newRole });
      addToast(`Usuario "${newUsername}" creado.`, 'success');
      setShowCreate(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('Viewer');
      load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al crear usuario.', 'error');
    } finally {
      setCreating(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
          <button onClick={() => setShowCreate((v) => !v)} className="btn-primary">
            {showCreate ? 'Cancelar' : '+ Nuevo usuario'}
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="card space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Nuevo usuario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Usuario</label>
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="input-field w-full"
                  required
                  maxLength={60}
                />
              </div>
              <div>
                <label className="label">Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field w-full"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="label">Rol</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Viewer')}
                  className="input-field w-full"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={creating} className="btn-primary disabled:opacity-60">
                {creating ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
        )}

        {loading && <LoadingSpinner />}
        {error   && <ErrorMessage message={error} onRetry={load} />}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Creado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((u) => (
                  <EditRow
                    key={u.userId}
                    user={u}
                    onSave={handleSave}
                    onPassword={setPwdUserId}
                    saving={savingId === u.userId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pwdUserId !== null && (
        <ConfirmDialog
          message={
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Nueva contraseña para <strong>{users.find(u => u.userId === pwdUserId)?.username}</strong>:</p>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="input-field w-full"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                autoFocus
              />
            </div>
          }
          onConfirm={handleChangePassword}
          onCancel={() => { setPwdUserId(null); setNewPwd(''); }}
          loading={savingPwd}
          confirmLabel="Cambiar"
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
