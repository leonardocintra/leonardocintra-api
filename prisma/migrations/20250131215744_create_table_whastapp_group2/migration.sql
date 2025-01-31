/*
  Warnings:

  - You are about to drop the `WhastappGroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WhastappGroups";

-- CreateTable
CREATE TABLE "WhatsappGroups" (
    "id" SERIAL NOT NULL,
    "groupId" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "transcribeAudio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WhatsappGroups_pkey" PRIMARY KEY ("id")
);
