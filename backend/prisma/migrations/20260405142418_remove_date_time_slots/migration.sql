/*
  Warnings:

  - You are about to drop the column `date` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Appointment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Appointment_date_time_key";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "date",
DROP COLUMN "time";
