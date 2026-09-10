/*
  Warnings:

  - You are about to drop the `SalaoReservas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaoReservasLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaoTemaImagens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaoTemas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SalaoReservas" DROP CONSTRAINT "SalaoReservas_leadId_fkey";

-- DropForeignKey
ALTER TABLE "SalaoReservas" DROP CONSTRAINT "SalaoReservas_temaId_fkey";

-- DropForeignKey
ALTER TABLE "SalaoReservasLog" DROP CONSTRAINT "SalaoReservasLog_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "SalaoTemaImagens" DROP CONSTRAINT "SalaoTemaImagens_temaId_fkey";

-- DropTable
DROP TABLE "SalaoReservas";

-- DropTable
DROP TABLE "SalaoReservasLog";

-- DropTable
DROP TABLE "SalaoTemaImagens";

-- DropTable
DROP TABLE "SalaoTemas";

-- DropEnum
DROP TYPE "SalaoStatusReservaEnum";
