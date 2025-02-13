-- AlterTable
ALTER TABLE "WhatsAppAudioToTextAccount" ADD COLUMN     "pairingCode" VARCHAR(20),
ADD COLUMN     "pairingCodeExpiresAt" TIMESTAMP(3);
