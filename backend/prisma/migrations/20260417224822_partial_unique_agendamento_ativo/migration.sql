-- RN01: sobreposição não é permitida apenas entre agendamentos ATIVOS
-- (AGENDADO, CONFIRMADO). Trocamos o índice único total por um índice
-- único parcial, permitindo que um horário CANCELADO/REALIZADO libere
-- a tupla (medico_id, periodo_inicio) para um novo agendamento.

-- DropIndex
DROP INDEX "agendamentos_medico_id_periodo_inicio_key";

-- CreateIndex
CREATE UNIQUE INDEX "agendamentos_medico_id_periodo_inicio_ativo_key"
  ON "agendamentos" ("medico_id", "periodo_inicio")
  WHERE status IN ('AGENDADO', 'CONFIRMADO');
