-- CreateTable
CREATE TABLE "padre_ramon_contato" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "padre_ramon_contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "padre_ramon_registro_graca" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "whatsapp" VARCHAR(20),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "padre_ramon_registro_graca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "padre_ramon_registro_visita_tumulo" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "whatsapp" VARCHAR(20),
    "message" TEXT,
    "pais" VARCHAR(50) DEFAULT 'Brasil',
    "numeroDePessoas" INTEGER DEFAULT 1,
    "dataDaVisita" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "padre_ramon_registro_visita_tumulo_pkey" PRIMARY KEY ("id")
);
