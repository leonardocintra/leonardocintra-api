/*
  Warnings:

  - You are about to drop the column `tema` on the `SalaoReservas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SalaoReservas" DROP COLUMN "tema",
ADD COLUMN     "temaId" INTEGER;

-- CreateTable
CREATE TABLE "SalaoTemas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "SalaoTemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaoTemaImagens" (
    "id" SERIAL NOT NULL,
    "temaId" INTEGER NOT NULL,
    "imagem" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(255),

    CONSTRAINT "SalaoTemaImagens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalaoReservas" ADD CONSTRAINT "SalaoReservas_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "SalaoTemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaoTemaImagens" ADD CONSTRAINT "SalaoTemaImagens_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "SalaoTemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
