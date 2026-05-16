export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Sistema de gestión de expedientes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/expedientes"
          className="card hover:shadow-md transition-shadow flex flex-col gap-2 cursor-pointer group"
        >
          <div className="text-blue-600 text-3xl">📋</div>
          <h2 className="font-semibold text-gray-800 group-hover:text-blue-700">
            Ver expedientes
          </h2>
          <p className="text-sm text-gray-500">
            Consulta, busca y filtra todos los expedientes registrados.
          </p>
        </a>

        <a
          href="/expedientes/nuevo"
          className="card hover:shadow-md transition-shadow flex flex-col gap-2 cursor-pointer group"
        >
          <div className="text-green-600 text-3xl">➕</div>
          <h2 className="font-semibold text-gray-800 group-hover:text-green-700">
            Nuevo expediente
          </h2>
          <p className="text-sm text-gray-500">
            Registra un nuevo expediente con todos sus datos.
          </p>
        </a>
      </div>

      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">Búsqueda rápida</h3>
        <form action="/expedientes" className="flex gap-2">
          <input
            name="search"
            placeholder="Buscar por nombre, cédula o número de expediente..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
}
