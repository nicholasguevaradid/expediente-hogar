'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <a href="/" className="text-lg font-semibold text-blue-700 hover:text-blue-800">
        Expediente Hogar
      </a>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <a href="/expedientes" className="text-sm text-gray-600 hover:text-blue-700 font-medium">
              Expedientes
            </a>
            {user.role === 'Admin' && (
              <a href="/usuarios" className="text-sm text-gray-600 hover:text-blue-700 font-medium">
                Usuarios
              </a>
            )}
            <span className="text-sm text-gray-400 hidden sm:inline">
              {user.username}
              {user.role !== 'Viewer' && (
                <span className="ml-1 text-xs text-blue-600 font-medium">({user.role})</span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 font-medium"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
