import { test, expect } from '@playwright/test';
import { completeAdultEnrollment, completeMinorEnrollment } from './helpers/enrollment-flow';
import { findMatriculaByEmail, waitForDbRecord } from './helpers/db-verify';

/**
 * Fluxo E2E de matrícula com persistência real via API/PostgreSQL.
 */
test.describe('Matrícula — fluxo completo', () => {
  test('adulto preenche todos os passos, persiste no banco e confirma matrícula', async ({ page }) => {
    const result = await completeAdultEnrollment(page);

    await expect(page.getByText(result.email)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Criar Conta de Acesso' })).toBeVisible();

    const matricula = await waitForDbRecord(() => findMatriculaByEmail(result.email));

    expect(matricula.full_name).toBe(result.fullName);
    expect(matricula.email).toBe(result.email.toLowerCase());
    expect(matricula.cpf).toBe(result.cpf);
    expect(matricula.protocolo).toMatch(/^HP\d{10}$/);
    expect(matricula.course_name).toBe('Pedagogia');
  });

  test('menor de idade inclui responsável e persiste no banco', async ({ page }) => {
    const result = await completeMinorEnrollment(page);

    await expect(page.getByText(result.email)).toBeVisible();

    const matricula = await waitForDbRecord(() => findMatriculaByEmail(result.email));

    expect(matricula.full_name).toBe(result.fullName);
    expect(matricula.email).toBe(result.email.toLowerCase());
    expect(matricula.cpf).toBe(result.cpf);
  });
});

/**
 * Validação por passo — não depende da API.
 */
test.describe('Matrícula — validações', () => {
  test('passo 1 exige campos obrigatórios', async ({ page }) => {
    await page.goto('/matricula');
    await page.getByRole('button', { name: 'Próximo →' }).click();

    await expect(page.getByText('Nome completo é obrigatório')).toBeVisible();
    await expect(page.getByText('Data de nascimento é obrigatória')).toBeVisible();
    await expect(page.getByText('Selecione o gênero')).toBeVisible();
    await expect(page.getByText('CPF é obrigatório')).toBeVisible();
  });
});
