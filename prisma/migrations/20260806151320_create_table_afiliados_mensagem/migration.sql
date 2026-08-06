-- CreateTable
CREATE TABLE "afiliados_mensagem_externa" (
    "id" SERIAL NOT NULL,
    "origem" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',

    CONSTRAINT "afiliados_mensagem_externa_pkey" PRIMARY KEY ("id")
);
