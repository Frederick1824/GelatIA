const setupTestDatabase = require("./globalSetup");

let prisma;

beforeAll(async () => {
  await setupTestDatabase();
  prisma = require("../../src/config/prisma");
});

beforeEach(async () => {
  await prisma.pool.query('DELETE FROM "User"');
  await prisma.branchFlavor.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.flavor.deleteMany();
  await prisma.business.deleteMany();
});

afterAll(async () => {
  if (!prisma) {
    return;
  }

  await prisma.$disconnect();
  await prisma.pool.end();
});
