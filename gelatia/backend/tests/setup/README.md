This test setup uses the real Prisma migrations against `gelatia_test`.

Current behavior:
- `globalSetup.js` ensures the test database exists.
- It resets the `public` schema in `gelatia_test`.
- Then it tries `prisma migrate deploy` using the committed migrations in [`prisma/migrations`](C:/Users/PC/GelatIA/gelatia/backend/prisma/migrations).
- If Prisma CLI cannot run because the engine binary is unavailable in the environment, it falls back to executing the committed `migration.sql` files directly.
- The schema for tests now comes from Prisma migrations, not from duplicated hand-written table SQL.

Remaining limitation:
- The first time Prisma CLI needs a missing engine binary, it may require network access or a pre-cached local binary depending on the environment.
- In that case tests still work through the SQL fallback, but Prisma CLI commands themselves can remain environment-dependent until the engine is available.

Maintenance rule:
1. Change [`schema.prisma`](C:/Users/PC/GelatIA/gelatia/backend/prisma/schema.prisma).
2. Generate a new Prisma migration.
3. Commit the migration files.
4. Run `npm test`.
