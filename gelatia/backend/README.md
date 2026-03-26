# GelatIA Backend

## Base de datos y Prisma

### Requisitos
- PostgreSQL corriendo localmente
- Base de desarrollo: `gelatia`
- Base de test: `gelatia_test`

Las URLs se configuran en:
- [`.env`](C:/Users/PC/GelatIA/gelatia/backend/.env)
- [`.env.test`](C:/Users/PC/GelatIA/gelatia/backend/.env.test)
- [`.env.example`](C:/Users/PC/GelatIA/gelatia/backend/.env.example)

Desarrollo y test usan bases distintas para evitar que la suite toque datos de desarrollo.
El flujo oficial de onboarding del negocio es `POST /auth/register`.
`POST /business` queda deprecado.

### Inicializar base de desarrollo
Aplicar las migraciones versionadas:
```bash
cd C:\Users\PC\GelatIA\gelatia\backend
npm run db:deploy
```

Si vas a cambiar `schema.prisma` y queres crear una nueva migracion:
```bash
cd C:\Users\PC\GelatIA\gelatia\backend
npm run db:migrate -- --name nombre_del_cambio
```

### Inicializar base de test
La suite lo hace automaticamente antes de correr cada archivo de test:
```bash
cd C:\Users\PC\GelatIA\gelatia\backend
npm run test:prepare-db
```

Ese paso:
1. verifica que exista `gelatia_test`
2. resetea el schema `public`
3. intenta aplicar `prisma migrate deploy`
4. si Prisma CLI no puede correr por falta de engine, aplica los `migration.sql` versionados como fallback

### Correr migraciones
Validar schema:
```bash
npx prisma validate
```

Aplicar migraciones versionadas:
```bash
npm run db:deploy
```

Generar una nueva migracion:
```bash
npm run db:migrate -- --name nombre_del_cambio
```

### Deploy de demo
Variables necesarias:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

Comandos recomendados en Render o Railway:
- Install/build: `npm install`
- Start: `npm start`
- Migraciones antes de levantar la app: `npm run db:deploy`

Notas de Prisma:
- El proyecto usa [prisma.config.ts](C:/Users/PC/GelatIA/gelatia/backend/prisma.config.ts) para tomar `DATABASE_URL`.
- `prisma generate` corre automaticamente en `postinstall`, asi que no hace falta un paso manual extra si el proveedor ejecuta install scripts.
- Si el proveedor separa build y start, conviene igualmente dejar `npm run db:deploy` como pre-deploy/release command.

### Correr tests
```bash
npm test
```

### Limitaciones abiertas
- Si Prisma CLI necesita descargar un engine faltante y el entorno no tiene red ni cache local, algunos comandos Prisma pueden bloquearse.
- En testing, ese problema esta mitigado con fallback a los `migration.sql` versionados.
- La base de desarrollo actual puede tener drift si fue creada antes de versionar migraciones. En ese caso conviene reinicializarla de forma controlada o marcar el estado con criterio explicito antes de seguir agregando cambios.
