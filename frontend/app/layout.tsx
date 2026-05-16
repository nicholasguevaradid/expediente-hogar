import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expediente Hogar',
  description: 'Sistema de gestión de expedientes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <a href="/" className="text-lg font-semibold text-blue-700 hover:text-blue-800">
            Expediente Hogar
          </a>
          <a
            href="/expedientes"
            className="text-sm text-gray-600 hover:text-blue-700 font-medium"
          >
            Expedientes
          </a>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
