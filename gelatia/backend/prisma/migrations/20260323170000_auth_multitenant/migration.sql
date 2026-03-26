-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'STAFF');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "businessId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Flavor" ADD COLUMN "businessId" INTEGER;

-- Backfill existing flavors when there is already business data
UPDATE "Flavor"
SET "businessId" = (
    SELECT br."businessId"
    FROM "BranchFlavor" bf
    INNER JOIN "Branch" br ON br."id" = bf."branchId"
    WHERE bf."flavorId" = "Flavor"."id"
    LIMIT 1
)
WHERE "businessId" IS NULL;

UPDATE "Flavor"
SET "businessId" = (
    SELECT "id"
    FROM "Business"
    ORDER BY "id"
    LIMIT 1
)
WHERE "businessId" IS NULL;

ALTER TABLE "Flavor" ALTER COLUMN "businessId" SET NOT NULL;

-- DropIndex
DROP INDEX "Flavor_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Flavor_businessId_name_key" ON "Flavor"("businessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Flavor" ADD CONSTRAINT "Flavor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
