import { test, expect } from '@playwright/test';
import { registrationData, uniqueCpf, uniqueEmail } from './fixtures/test-data';
import { findUsuarioByEmail, waitForDbRecord } from './helpers/db-verify';

/**
 * Fluxo E2E de cadastro de conta com persistência real via API/PostgreSQL.
 */
test.describe('Cadastro — criar conta', () => {
  test('preenche formulário completo, persiste no banco e exibe sucesso', async ({ page }) => {
    const email = uniqueEmail('cadastro');
    const cpf = uniqueCpf();

    await page.goto('/cadastro');
    await expect(page.getByRole('heading', { name: 'Criar Conta' })).toBeVisible();

    await page.locator('#fullName').fill(registrationData.fullName);
    await page.locator('#email').fill(email);
    await page.locator('#phone').fill(registrationData.phone);
    await page.locator('#cpf').fill(cpf);
    await page.locator('#password').fill(registrationData.password);
    await page.locator('#confirmPassword').fill(registrationData.password);
    await page.locator('#acceptTerms').check();

    await page.getByRole('button', { name: 'Criar Conta' }).click();

    await expect(page.getByText('Conta criada com sucesso!')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ir para Login' })).toBeVisible();

    const usuario = await waitForDbRecord(() => findUsuarioByEmail(email));

    expect(usuario.full_name).toBe(registrationData.fullName);
    expect(usuario.email).toBe(email.toLowerCase());
    expect(usuario.cpf).toBe(cpf.replace(/\D/g, ''));
    expect(usuario.user_type).toBe(registrationData.userType);
  });

  test('exibe erros quando campos obrigatórios estão vazios', async ({ page }) => {
    await page.goto('/cadastro');
    await page.getByRole('button', { name: 'Criar Conta' }).click();

    await expect(page.getByText('Nome completo é obrigatório')).toBeVisible();
    await expect(page.getByText('E-mail é obrigatório')).toBeVisible();
    await expect(page.getByText('Telefone é obrigatório')).toBeVisible();
    await expect(page.getByText('CPF é obrigatório')).toBeVisible();
  });
});
