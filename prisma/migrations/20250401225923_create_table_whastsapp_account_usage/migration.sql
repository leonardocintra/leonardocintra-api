-- CreateTable
CREATE TABLE "WhatsAppAudioToTextAccountUsage" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "messageId" VARCHAR(20) NOT NULL,
    "messageTimestamp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppAudioToTextAccountUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WhatsAppAudioToTextAccountUsage" ADD CONSTRAINT "WhatsAppAudioToTextAccountUsage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
