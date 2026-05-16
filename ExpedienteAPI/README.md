# Expediente Hogar — API

API REST para registrar, consultar, editar y administrar expedientes.  
Construida con **ASP.NET Core 10**, **Dapper** y **SQL Server**.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0 |
| SQL Server | LocalDB (incluido con Visual Studio) o SQL Server Express |
| Visual Studio 2022+ / VS Code | — |

Verificar instalación:
```bash
dotnet --version        # debe mostrar 10.x
sqllocaldb info         # debe listar instancias
```

---

## Configuración de base de datos

### Opción A — Base de datos nueva (recomendado)

1. Abrir la solución `ExpedienteAPI.slnx` en Visual Studio 2022.
2. Click derecho sobre el proyecto **MedRecordsDB** → **Publish**.
3. Seleccionar como destino `(localdb)\MSSQLLocalDB` con nombre de BD `MedRecordsDB`.
4. Publicar — crea las tablas y stored procedures automáticamente.

### Opción B — Base de datos existente (migración)

Si ya tenías la BD y solo necesitas agregar los campos nuevos:

```sql
-- Ejecutar en SSMS o Azure Data Studio contra MedRecordsDB:
sqlcmd -S "(localdb)\MSSQLLocalDB" -i MedRecordsDB\Migrations\001_AddExpedienteFields.sql
```

---

## Variables de entorno / Configuración

El archivo `ExpedienteAPI/appsettings.json` contiene la cadena de conexión:

```json
{
  "ConnectionStrings": {
    "BD": "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=MedRecordsDB;Integrated Security=True;Encrypt=False"
  },
  "AllowedOrigins": [
    "http://localhost:3000",
    "http://localhost:5173"
  ]
}
```

Para producción, sobrescribir con variables de entorno:
```bash
ConnectionStrings__BD="Server=...;Database=...;User Id=...;Password=...;"
```

---

## Correr el backend

```bash
cd ExpedienteAPI/ExpedienteAPI
dotnet run
```

O desde la raíz de la solución:
```bash
dotnet run --project ExpedienteAPI/ExpedienteAPI/ExpedienteAPI.csproj
```

El API queda disponible en:
- HTTP:  `http://localhost:5192`
- HTTPS: `https://localhost:7099`
- Swagger UI: `http://localhost:5192/swagger`

---

## Endpoints disponibles

### Expedientes (Patients)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/patients` | Listar expedientes |
| `GET` | `/api/patients?search=ana` | Buscar por nombre, cédula, número de expediente, etc. |
| `GET` | `/api/patients?estado=Activo` | Filtrar por estado |
| `GET` | `/api/patients?search=ana&estado=Activo` | Búsqueda + filtro combinados |
| `GET` | `/api/patients/{id}` | Obtener expediente por ID |
| `GET` | `/api/patients/{id}/records` | Expediente con todos sus registros médicos |
| `POST` | `/api/patients` | Crear expediente |
| `PUT` | `/api/patients/{id}` | Editar expediente |
| `DELETE` | `/api/patients/{id}` | Eliminar expediente |

### Registros médicos (Records)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/records/{id}` | Obtener registro médico por ID |
| `GET` | `/api/patients/{id}/records` | Listar registros de un expediente |
| `POST` | `/api/patients/{id}/records` | Crear registro médico |
| `PUT` | `/api/records/{id}` | Editar registro médico |
| `DELETE` | `/api/records/{id}` | Eliminar registro médico |

---

## Ejemplos de requests

### Crear expediente
```http
POST /api/patients
Content-Type: application/json

{
  "identificacion": "1-1234-5678",
  "firstName": "María",
  "lastName": "González",
  "secLastName": "Pérez",
  "birth_Date": "1990-05-15",
  "gender": "F",
  "phoneNum": "8888-9999",
  "email": "maria@ejemplo.com",
  "addressLine1": "Barrio Los Robles, casa 12",
  "canton": "San José",
  "estado": "Activo",
  "observaciones": "Paciente referida por el EBAIS."
}
```

**Respuesta exitosa (201):**
```json
{ "patientId": 1 }
```

El `numeroExpediente` se genera automáticamente con el formato `EXP-2025-000001`.

---

### Listar expedientes con búsqueda
```http
GET /api/patients?search=González&estado=Activo
```

---

### Editar expediente
```http
PUT /api/patients/1
Content-Type: application/json

{
  "identificacion": "1-1234-5678",
  "firstName": "María",
  "lastName": "González",
  "estado": "Inactivo",
  "observaciones": "Expediente cerrado por traslado."
}
```

---

### Crear registro médico
```http
POST /api/patients/1/records
Content-Type: application/json

{
  "patientId": 1,
  "visitDate": "2025-05-15",
  "diagnosis": "Hipertensión leve",
  "notes": "Se recomienda dieta baja en sodio.",
  "bloodPressure": "140/90",
  "weightKg": 72.5,
  "heightCm": 165.0
}
```

---

## Formato de errores

Todas las respuestas de error siguen este formato:

```json
{
  "message": "Descripción del error.",
  "status": 404,
  "timestamp": "2025-05-15T10:30:00Z"
}
```

Códigos usados:
- `400` — Validación o datos inválidos
- `404` — Recurso no encontrado
- `500` — Error interno del servidor

---

## Estructura del proyecto

```
ExpedienteAPI/
├── ExpedienteAPI/          → Web API (controllers, Program.cs, config)
├── MedContracts/           → Modelos, DTOs e interfaces
├── MedRecordFlujo/         → Lógica de negocio
├── RepoDapper/             → Acceso a datos (Dapper + SQL Server)
└── MedRecordsDB/           → Proyecto SQL (tablas, stored procedures)
    └── Migrations/         → Scripts de migración para BD existentes
```

---

## Estados del expediente

Los valores válidos para el campo `estado` son:
- `Activo` (por defecto)
- `Inactivo`
- `Cerrado`
- `Pendiente`

---

## Frontend

El frontend web se encuentra en `/frontend`. Ver instrucciones en `frontend/README.md`.

Para correr todo junto:

```bash
# Terminal 1 — Backend
cd ExpedienteAPI/ExpedienteAPI
dotnet run

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:5192
- Frontend: http://localhost:3000
- Swagger: http://localhost:5192/swagger
