import { expect, type Page } from '@playwright/test';
import { enrollmentAdult, enrollmentMinor, uniqueCpf, uniqueEmail } from '../fixtures/test-data';

type AdultEnrollment = typeof enrollmentAdult;
type MinorEnrollment = typeof enrollmentMinor;

export interface EnrollmentResult {
  email: string;
  fullName: string;
  cpf: string;
}

/**
 * Preenche o passo 1 (Dados Pessoais) do formulário de matrícula.
 * @param page - Instância da página Playwright.
 * @param data - Dados pessoais do aluno.
 */
async function fillPersonalStep(page: Page, data: AdultEnrollment | MinorEnrollment): Promise<void> {
  await page.goto('/matricula');
  await expect(page.getByRole('heading', { name: 'Formulário de Matrícula' })).toBeVisible();

  await page.locator('#fullName').fill(data.fullName);

  if (data.socialName) {
    await page.locator('#socialName').fill(data.socialName);
  }

  await page.locator('#birthDate').fill(data.birthDate);
  await page.locator('#gender').selectOption(data.gender);
  await page.locator('#cpf').fill(data.cpf);
  await page.locator('#rg').fill(data.rg);
  await page.locator('#nationality').fill(data.nationality);
  await page.locator('#birthPlace').fill(data.birthPlace);

  await page.getByRole('button', { name: 'Próximo →' }).click();
}

/**
 * Preenche o passo 2 (Contato & Endereço) e aguarda autofill do CEP via ViaCEP.
 * @param page - Instância da página Playwright.
 * @param data - Dados de contato e endereço.
 * @param email - E-mail único gerado para a execução.
 */
async function fillContactStep(
  page: Page,
  data: AdultEnrollment | MinorEnrollment,
  email: string,
): Promise<void> {
  await expect(page.getByRole('heading', { name: '📧 Contato & Endereço' })).toBeVisible();

  await page.locator('#email').fill(email);
  await page.locator('#phone').fill(data.phone);
  await page.locator('#whatsapp').fill(data.whatsapp);
  await page.locator('#address\\.cep').fill(data.address.cep);
  await page.locator('#address\\.cep').blur();

  await expect(page.locator('#address\\.street')).not.toHaveValue('', { timeout: 15_000 });

  await page.locator('#address\\.number').fill(data.address.number);
  await page.locator('#address\\.complement').fill(data.address.complement);

  await page.getByRole('button', { name: 'Próximo →' }).click();
}

/**
 * Preenche o passo 3 (Dados Acadêmicos) do formulário de matrícula.
 * @param page - Instância da página Playwright.
 * @param data - Dados acadêmicos do aluno.
 */
async function fillAcademicStep(page: Page, data: AdultEnrollment | MinorEnrollment): Promise<void> {
  await expect(page.getByRole('heading', { name: '🎓 Dados Acadêmicos' })).toBeVisible();

  await page.locator('#courseLevel').selectOption(data.academic.courseLevel);
  await page.locator('#courseName').selectOption(data.academic.courseName);
  await page.locator('#shift').selectOption(data.academic.shift);
  await page.locator('#previousSchool').fill(data.academic.previousSchool);
  await page.locator('#yearOfCompletion').fill(data.academic.yearOfCompletion);

  await page.getByRole('button', { name: 'Próximo →' }).click();
}

/**
 * Preenche o passo 4 (Responsável) quando o aluno é menor de 18 anos.
 * @param page - Instância da página Playwright.
 * @param data - Dados do responsável legal.
 */
async function fillGuardianStep(page: Page, data: MinorEnrollment): Promise<void> {
  await expect(page.getByRole('heading', { name: '👨‍👩‍👧 Dados do Responsável' })).toBeVisible();

  await page.locator('#guardian\\.name').fill(data.guardian.name);
  await page.locator('#guardian\\.cpf').fill(data.guardian.cpf);
  await page.locator('#guardian\\.relationship').selectOption(data.guardian.relationship);
  await page.locator('#guardian\\.phone').fill(data.guardian.phone);
  await page.locator('#guardian\\.email').fill(uniqueEmail('responsavel'));

  await page.getByRole('button', { name: 'Próximo →' }).click();
}

/**
 * Preenche o passo 5 (Complementar) do formulário de matrícula.
 * @param page - Instância da página Playwright.
 * @param data - Informações complementares e esportes.
 */
async function fillAdditionalStep(page: Page, data: AdultEnrollment | MinorEnrollment): Promise<void> {
  await expect(page.getByRole('heading', { name: '⚽ Esportes & Informações Complementares' })).toBeVisible();

  const sportLabels: Record<string, string> = {
    natacao: 'Natação',
    karate: 'Karatê',
    capoeira: 'Capoeira',
    futebol: 'Futebol Society',
    volei: 'Vôlei',
    basquete: 'Basquete',
    judo: 'Judô',
  };

  for (const sportId of data.additional.sports) {
    const label = sportLabels[sportId];
    if (label) {
      await page.getByText(label, { exact: true }).click();
    }
  }

  await page.locator('#specialNeeds').fill(data.additional.specialNeeds);
  await page.locator('#medicalInfo').fill(data.additional.medicalInfo);
  await page.locator('#howFoundUs').selectOption(data.additional.howFoundUs);
  await page.locator('#observations').fill(data.additional.observations);

  await page.getByRole('button', { name: 'Próximo →' }).click();
}

/**
 * Confirma o passo 6 (Revisão) e envia a matrícula.
 * @param page - Instância da página Playwright.
 * @param studentName - Nome do aluno exibido na tela de sucesso.
 */
async function confirmReviewStep(page: Page, studentName: string): Promise<void> {
  await expect(page.getByRole('heading', { name: '📋 Revisão dos Dados' })).toBeVisible();

  await page.locator('#acceptTerms').check();
  await page.locator('#acceptPrivacy').check();
  await page.locator('#acceptMarketing').check();

  await page.getByRole('button', { name: '✅ Confirmar Matrícula' }).click();

  await expect(page.getByRole('heading', { name: 'Matrícula Enviada com Sucesso!' })).toBeVisible();
  await expect(page.getByText(studentName)).toBeVisible();
}

/**
 * Executa o fluxo completo de matrícula para aluno adulto (pula etapa de responsável).
 * @param page - Instância da página Playwright.
 */
export async function completeAdultEnrollment(page: Page): Promise<EnrollmentResult> {
  const email = uniqueEmail('matricula.adulto');
  const data = { ...enrollmentAdult, cpf: uniqueCpf() };

  await fillPersonalStep(page, data);
  await fillContactStep(page, data, email);
  await fillAcademicStep(page, data);
  await fillAdditionalStep(page, data);
  await confirmReviewStep(page, data.fullName);

  return { email, fullName: data.fullName, cpf: data.cpf.replace(/\D/g, '') };
}

/**
 * Executa o fluxo completo de matrícula para aluno menor de idade.
 * @param page - Instância da página Playwright.
 */
export async function completeMinorEnrollment(page: Page): Promise<EnrollmentResult> {
  const email = uniqueEmail('matricula.menor');
  const data = {
    ...enrollmentMinor,
    cpf: uniqueCpf(),
    guardian: {
      ...enrollmentMinor.guardian,
      cpf: uniqueCpf(),
    },
  };

  await fillPersonalStep(page, data);
  await fillContactStep(page, data, email);
  await fillAcademicStep(page, data);
  await fillGuardianStep(page, data);
  await fillAdditionalStep(page, data);
  await confirmReviewStep(page, data.fullName);

  return { email, fullName: data.fullName, cpf: data.cpf.replace(/\D/g, '') };
}
