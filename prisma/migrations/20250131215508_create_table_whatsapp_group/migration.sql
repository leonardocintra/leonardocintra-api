-- CreateTable
CREATE TABLE "WhastappGroups" (
    "id" SERIAL NOT NULL,
    "groupId" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "transcribeAudio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WhastappGroups_pkey" PRIMARY KEY ("id")
);
