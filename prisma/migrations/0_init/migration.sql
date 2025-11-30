-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'MERCADO_PAGO_ASSINATURA');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "config" JSONB NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PIX',
    "nextBillingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappGroups" (
    "id" SERIAL NOT NULL,
    "groupId" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "transcribeAudio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WhatsappGroups_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Leads" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppAudioToTextAccount" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "instanceName" VARCHAR(60) NOT NULL,
    "instanceId" VARCHAR(50) NOT NULL,
    "hash" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "integration" VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP-BAILEYS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedSuccessfully" BOOLEAN NOT NULL DEFAULT true,
    "retry" INTEGER NOT NULL DEFAULT 0,
    "pairingCode" VARCHAR(20),
    "pairingCodeExpiresAt" TIMESTAMP(3),
    "instructionsSent" BOOLEAN NOT NULL DEFAULT false,
    "pairingCodeManual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WhatsAppAudioToTextAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppAudioToTextAccountUsage" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "messageId" VARCHAR(100) NOT NULL,
    "messageTimestamp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppAudioToTextAccountUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Leads_phone_key" ON "Leads"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAudioToTextAccount_instanceName_key" ON "WhatsAppAudioToTextAccount"("instanceName");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAudioToTextAccount_instanceId_key" ON "WhatsAppAudioToTextAccount"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAudioToTextAccount_hash_key" ON "WhatsAppAudioToTextAccount"("hash");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppAudioToTextAccount" ADD CONSTRAINT "WhatsAppAudioToTextAccount_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppAudioToTextAccountUsage" ADD CONSTRAINT "WhatsAppAudioToTextAccountUsage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

