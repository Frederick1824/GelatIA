const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { Client } = require("pg");
const dotenv = require("dotenv");

function parseDatabaseName(connectionString) {
  const url = new URL(connectionString);
  return url.pathname.replace(/^\//, "");
}

function runPrisma(args, env, errorMessage) {
  const result = spawnSync("npx.cmd", ["prisma", ...args], {
    cwd: path.resolve(__dirname, "../.."),
    env,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const error = new Error(
      [errorMessage, result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n\n")
    );
    error.prismaCommandFailed = true;
    throw error;
  }
}

async function applyMigrationFiles(testClient) {
  const migrationsDir = path.resolve(__dirname, "../../prisma/migrations");
  const migrationFolders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const folder of migrationFolders) {
    const migrationPath = path.join(migrationsDir, folder, "migration.sql");

    if (!fs.existsSync(migrationPath)) {
      continue;
    }

    const sql = fs.readFileSync(migrationPath, "utf8");
    await testClient.query(sql);
  }
}

module.exports = async () => {
  const envPath = path.resolve(__dirname, "../../.env.test");
  const envContents = dotenv.parse(fs.readFileSync(envPath));
  const testUrl = envContents.TEST_DATABASE_URL || envContents.DATABASE_URL;

  if (!testUrl) {
    throw new Error("TEST_DATABASE_URL o DATABASE_URL deben estar configuradas en .env.test");
  }

  const databaseName = parseDatabaseName(testUrl);
  const adminUrl = new URL(testUrl);
  adminUrl.pathname = "/postgres";
  adminUrl.search = "";

  const adminClient = new Client({ connectionString: adminUrl.toString() });
  await adminClient.connect();

  const existingDatabase = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName]
  );

  if (existingDatabase.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${databaseName}"`);
  }

  await adminClient.end();

  const prismaEnv = {
    ...process.env,
    ...envContents,
    DATABASE_URL: testUrl,
    TEST_DATABASE_URL: testUrl,
  };

  const testClient = new Client({ connectionString: testUrl });
  await testClient.connect();
  await testClient.query('DROP SCHEMA IF EXISTS "public" CASCADE;');
  await testClient.query('CREATE SCHEMA "public";');

  try {
    runPrisma(
      ["migrate", "deploy"],
      prismaEnv,
      "No se pudieron aplicar las migraciones Prisma sobre la base de test"
    );
  } catch (error) {
    if (!error.prismaCommandFailed) {
      throw error;
    }

    await applyMigrationFiles(testClient);
  }

  await testClient.end();
};
