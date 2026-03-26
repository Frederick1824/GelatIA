# GelatIA Frontend MVP

## Requisitos

- Node.js 18+
- Backend de GelatIA corriendo en `http://localhost:3000` o una `VITE_API_URL` equivalente

## Variables de entorno

Copiar `.env.example` a `.env.local` si hace falta cambiar la URL del backend.

Variable necesaria:
- `VITE_API_URL`: URL publica del backend. Ejemplo demo: `https://gelatia-api.up.railway.app`

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy en Vercel

- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Variable obligatoria:
  - `VITE_API_URL=https://tu-backend-publico`

## Notas

- El frontend usa el backend real actual para `auth`, `flavors`, `branches` y `users`.
- El login hoy no recibe nombre del business desde backend, por eso el nombre del negocio puede mostrarse como placeholder si la sesion no viene de registro.
