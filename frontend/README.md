# Expediente Hogar — Frontend

Interfaz web para el sistema de gestión de expedientes.  
Construida con **Next.js 14**, **TypeScript** y **Tailwind CSS**.

## Requisitos previos

- Node.js 18+
- Backend corriendo en `http://localhost:5192` (ver `../ExpedienteAPI/README.md`)

## Instalación

```bash
cd frontend
npm install
```

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta la URL del backend:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5192
```

## Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build de producción

```bash
npm run build
npm start
```

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Dashboard con búsqueda rápida |
| `/expedientes` | Listado con búsqueda y filtro por estado |
| `/expedientes/nuevo` | Crear expediente |
| `/expedientes/[id]` | Detalle del expediente + registros médicos |
| `/expedientes/[id]/editar` | Editar expediente |
| `/expedientes/[id]/registros/nuevo` | Agregar registro médico |

## Estructura

```
frontend/
├── app/              → Rutas (App Router de Next.js)
├── components/       → Componentes reutilizables
├── hooks/            → Custom hooks (useToast)
├── services/         → Cliente API centralizado
└── types/            → Tipos TypeScript
```
