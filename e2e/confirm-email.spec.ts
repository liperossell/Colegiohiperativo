import { test, expect } from '@playwright/test';
import { registrationData, uniqueCpf, uniqueEmail } from './fixtures/test-data';
import { registerUserAndGetActivationLink, getActivationLink, toActivationRoute } from './helpers/auth-flow';

/**
 * Valida renderização do logo Hiperativo no card da página de ativação de conta.
 * @param page Instância da página Playwright.
 */
async function expectAuthCardLogoVisible(page: import('@playwright/test').Page) {
  const logoContainer = page.locator('.auth-card__logo');
  const logoSvg = logoContainer.locator('.logo__symbol svg');

  await expect(logoContainer).toBeVisible();
  await expect(logoContainer).toHaveAttribute('aria-label', /Hiperativo/i);
  await expect(logoSvg).toBeVisible();

  const logoBox = await logoSvg.boundingBox();
  expect(logoBox?.width ?? 0).toBeGreaterThanOrEqual(48);
  expect(logoBox?.height ?? 0).toBeGreaterThanOrEqual(48);
}

test.describe('Ativação de conta — confirmar e-mail', () => {
  test('exibe logo Hiperativo ao abrir link de ativação recebido no cadastro', async ({ page }) => {
    const email = uniqueEmail('ativacao');
    const cpf = uniqueCpf();

    const registration = await registerUserAndGetActivationLink({
      fullName: registrationData.fullName,
      email,
      phone: registrationData.phone,
      cpf,
      password: registrationData.password,
      userType: registrationData.userType,
    });

    expect(getActivationLink(registration)).toContain('/confirmar-email?token=');

    await page.goto(toActivationRoute(getActivationLink(registration)));

    await expect(page.getByRole('heading', { name: 'Ativação de Conta' })).toBeVisible();
    await expectAuthCardLogoVisible(page);

    await expect(page.getByRole('heading', { name: /Parabéns/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Conta ativada com sucesso|Sua conta já está ativada/i)).toBeVisible();
    await expectAuthCardLogoVisible(page);
  });
});
