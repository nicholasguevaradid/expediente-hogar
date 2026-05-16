export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <h1 className="text-xl font-semibold text-gray-700">Página no encontrada</h1>
      <p className="text-gray-500 text-sm">La página que buscas no existe o fue movida.</p>
      <a href="/" className="btn-primary mt-2">
        Volver al inicio
      </a>
    </div>
  );
}
