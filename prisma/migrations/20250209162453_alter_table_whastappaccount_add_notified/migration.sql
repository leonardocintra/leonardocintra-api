-- AlterTable
ALTER TABLE "WhatsAppAudioToTextAccount" ADD COLUMN     "notifiedSuccessfully" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "retry" INTEGER NOT NULL DEFAULT 0;
