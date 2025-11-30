-- CreateEnum
CREATE TYPE "SalaoStatusReservaEnum" AS ENUM ('proposta', 'reservada', 'confirmada', 'cancelada', 'pendente_sinal');

-- CreateTable
CREATE TABLE "SalaoReservas" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "dataEvento" DATE NOT NULL,
    "horarioInicio" VARCHAR(10),
    "horarioFim" VARCHAR(10),
    "tipoLocacao" VARCHAR(50),
    "convidadosEst" INTEGER,
    "tema" VARCHAR(100),
    "sinalPago" BOOLEAN NOT NULL DEFAULT false,
    "valorTotal" DECIMAL,
    "valorSinal" DECIMAL,
    "status" "SalaoStatusReservaEnum" NOT NULL DEFAULT 'proposta',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "SalaoReservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaoReservasLog" (
    "id" SERIAL NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "evento" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaoReservasLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalaoReservas" ADD CONSTRAINT "SalaoReservas_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaoReservasLog" ADD CONSTRAINT "SalaoReservasLog_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "SalaoReservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
