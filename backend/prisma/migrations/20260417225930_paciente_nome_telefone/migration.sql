-- Paciente ganha nome e telefone obrigatórios; usuarioId passa a ser opcional
-- (permite cadastro de paciente sem conta de acesso — walk-in ou agendado pelo médico).

-- 1. Permite usuario_id NULL
ALTER TABLE "pacientes" ALTER COLUMN "usuario_id" DROP NOT NULL;

-- 2. nome: adiciona nullable, copia de usuarios.nome, depois força NOT NULL
ALTER TABLE "pacientes" ADD COLUMN "nome" TEXT;
UPDATE "pacientes" p SET "nome" = u."nome" FROM "usuarios" u WHERE p."usuario_id" = u."id";
UPDATE "pacientes" SET "nome" = 'Paciente sem nome' WHERE "nome" IS NULL;
ALTER TABLE "pacientes" ALTER COLUMN "nome" SET NOT NULL;

-- 3. telefone: backfill NULLs com placeholder, depois força NOT NULL
UPDATE "pacientes" SET "telefone" = '(00) 00000-0000' WHERE "telefone" IS NULL;
ALTER TABLE "pacientes" ALTER COLUMN "telefone" SET NOT NULL;

-- 4. Índice para busca de paciente por telefone (find-or-create do fluxo do médico)
CREATE INDEX "pacientes_telefone_idx" ON "pacientes"("telefone");
