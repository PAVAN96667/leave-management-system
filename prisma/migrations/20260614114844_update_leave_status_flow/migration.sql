/*
  Warnings:

  - The values [PENDING] on the enum `LeaveStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaveStatus_new" AS ENUM ('DRAFT', 'PENDING_MANAGER', 'MANAGER_APPROVED', 'PENDING_ADMIN', 'APPROVED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."Leave" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Leave" ALTER COLUMN "status" TYPE "LeaveStatus_new" USING ("status"::text::"LeaveStatus_new");
ALTER TYPE "LeaveStatus" RENAME TO "LeaveStatus_old";
ALTER TYPE "LeaveStatus_new" RENAME TO "LeaveStatus";
DROP TYPE "public"."LeaveStatus_old";
ALTER TABLE "Leave" ALTER COLUMN "status" SET DEFAULT 'PENDING_MANAGER';
COMMIT;

-- AlterTable
ALTER TABLE "Leave" ADD COLUMN     "approvedBy" INTEGER,
ADD COLUMN     "rejectedReason" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING_MANAGER';

-- AlterTable
ALTER TABLE "LeaveType" ALTER COLUMN "maxDays" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;

-- CreateTable
CREATE TABLE "LeaveAllocation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "leaveTypeId" INTEGER NOT NULL,
    "allocatedDays" INTEGER NOT NULL,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveAllocation_userId_leaveTypeId_year_key" ON "LeaveAllocation"("userId", "leaveTypeId", "year");

-- AddForeignKey
ALTER TABLE "LeaveAllocation" ADD CONSTRAINT "LeaveAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAllocation" ADD CONSTRAINT "LeaveAllocation_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
