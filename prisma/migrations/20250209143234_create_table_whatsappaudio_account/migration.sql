-- CreateTable
CREATE TABLE "WhatsAppAudioToTextAccount" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "instanceName" VARCHAR(60) NOT NULL,
    "instanceId" VARCHAR(50) NOT NULL,
    "hash" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "integration" VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP-BAILEYS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppAudioToTextAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAudioToTextAccount_instanceName_key" ON "WhatsAppAudioToTextAccount"("instanceName");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAudioToTextAccount_instanceId_key" ON "WhatsAppAudioToTextAccount"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAudioToTextAccount_hash_key" ON "WhatsAppAudioToTextAccount"("hash");

-- AddForeignKey
ALTER TABLE "WhatsAppAudioToTextAccount" ADD CONSTRAINT "WhatsAppAudioToTextAccount_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
