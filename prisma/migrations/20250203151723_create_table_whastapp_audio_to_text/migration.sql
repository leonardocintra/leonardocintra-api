-- CreateTable
CREATE TABLE "WhatsAppAudioToText" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "ownerPhone" VARCHAR(20),
    "sendBy" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" VARCHAR(10) NOT NULL DEFAULT 'text',
    "audioDuration" INTEGER NOT NULL DEFAULT 0,
    "audioMimetype" VARCHAR(40) NOT NULL DEFAULT 'text',
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppAudioToText_pkey" PRIMARY KEY ("id")
);
