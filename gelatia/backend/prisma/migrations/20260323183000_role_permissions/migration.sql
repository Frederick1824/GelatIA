-- CreateEnum
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'MANAGER', 'CASHIER');

-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "Role_new"
USING (
  CASE
    WHEN "role"::text = 'STAFF' THEN 'CASHIER'::"Role_new"
    ELSE "role"::text::"Role_new"
  END
);

-- DropEnum
DROP TYPE "Role";

-- RenameEnum
ALTER TYPE "Role_new" RENAME TO "Role";

-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'CASHIER';
