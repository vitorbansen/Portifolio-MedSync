import { test, expect } from '@playwright/test';

function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

test('fluxo completo: cadastro → login → busca → agendamento', async ({ page }) => {
  const suffix = uniqueSuffix();
  const email = `paciente-e2e-${suffix}@medsync.local`;
  const senha = 'senha12345';

  await page.goto('/register');
  await page.getByLabel(/Nome completo/i).fill('Paciente E2E');
  await page.getByLabel(/E-mail/i).fill(email);
  await page.getByLabel(/Telefone/i).fill('11999990000');
  await page.getByLabel(/Senha/i).fill(senha);
  await page.getByLabel(/Li e concordo/i).check();
  await page.getByRole('button', { name: /Cadastrar/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole('link', { name: /Buscar médicos/i }).click();
  await expect(page).toHaveURL(/\/medicos/);

  const primeiroAgendar = page.getByRole('link', { name: /Agendar/i }).first();
  await expect(primeiroAgendar).toBeVisible({ timeout: 15_000 });
  await primeiroAgendar.click();

  const primeiroSlot = page
    .locator('section')
    .getByRole('button')
    .filter({ hasText: /^\d{2}:\d{2}$/ })
    .first();
  await expect(primeiroSlot).toBeVisible({ timeout: 15_000 });
  await primeiroSlot.click();

  await page.getByRole('button', { name: /Confirmar agendamento/i }).click();

  await expect(page.getByRole('heading', { name: /Agendamento confirmado/i })).toBeVisible({
    timeout: 15_000,
  });
});

test('login com credenciais inválidas exibe erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/E-mail/i).fill('ninguem@medsync.local');
  await page.getByLabel(/Senha/i).fill('senhaerrada');
  await page.getByRole('button', { name: /Entrar/i }).click();

  await expect(page.getByText(/Credenciais inválidas|Falha/i)).toBeVisible();
  await expect(page).not.toHaveURL(/\/dashboard/);
});
