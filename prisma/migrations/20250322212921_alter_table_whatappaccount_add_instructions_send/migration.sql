-- AlterTable
ALTER TABLE "WhatsAppAudioToTextAccount" ADD COLUMN     "instructionsSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pairingCodeManual" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "active" SET DEFAULT false;
