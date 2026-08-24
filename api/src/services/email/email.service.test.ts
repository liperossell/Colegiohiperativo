import { describe, expect, it, vi, beforeEach } from "vitest";
import { TemplateNotFoundError, EmailProviderError } from "../../errors/email.errors.js";
import { EmailService } from "./email.service.js";

describe("email.service", () => {
  const templateLoader = {
    loadTemplate: vi.fn(),
    injectTemplateVariables: vi.fn((template: string, variables: Record<string, string>) => {
      let rendered = template;
      for (const [key, value] of Object.entries(variables)) {
        rendered = rendered.replaceAll(`{{${key}}}`, value);
      }
      return rendered;
    }),
  };
  const mailProvider = {
    send: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia e-mail quando template e variáveis são válidos", async () => {
    templateLoader.loadTemplate.mockResolvedValue("<p>Olá {{fullName}}</p>");
    mailProvider.send.mockResolvedValue(undefined);

    const service = new EmailService(templateLoader, mailProvider);
    const result = await service.sendTemplatedEmail({
      to: "aluno@test.com",
      template: "account-activation",
      subject: "Ative sua conta",
      variables: { fullName: "João" },
    });

    expect(result.ok).toBe(true);
    expect(mailProvider.send).toHaveBeenCalledWith({
      to: "aluno@test.com",
      subject: "Ative sua conta",
      html: "<p>Olá João</p>",
    });
  });

  it("propaga erro de template inexistente", async () => {
    templateLoader.loadTemplate.mockRejectedValue(new TemplateNotFoundError("foo"));

    const service = new EmailService(templateLoader, mailProvider);

    await expect(
      service.sendTemplatedEmail({
        to: "aluno@test.com",
        template: "foo",
        variables: {},
      })
    ).rejects.toBeInstanceOf(TemplateNotFoundError);
  });

  it("propaga erro do provedor de e-mail", async () => {
    templateLoader.loadTemplate.mockResolvedValue("<p>{{fullName}}</p>");
    mailProvider.send.mockRejectedValue(new EmailProviderError("Falha Gmail"));

    const service = new EmailService(templateLoader, mailProvider);

    await expect(
      service.sendTemplatedEmail({
        to: "aluno@test.com",
        template: "account-activation",
        variables: { fullName: "João" },
      })
    ).rejects.toBeInstanceOf(EmailProviderError);
  });

  it("gera link criptografado e envia e-mail de ativação", async () => {
    templateLoader.loadTemplate.mockResolvedValue(
      "<a href=\"{{activationLink}}\">{{fullName}}</a>"
    );
    mailProvider.send.mockResolvedValue(undefined);

    const service = new EmailService(templateLoader, mailProvider, {
      frontendUrl: "http://localhost:5173",
      activationSecret: "secret-test",
      activationTtlHours: 24,
    });

    const result = await service.sendAccountActivationEmail({
      to: "aluno@test.com",
      template: "account-activation",
      userId: "11111111-1111-1111-1111-111111111111",
      variables: { fullName: "João" },
    });

    expect(result.ok).toBe(true);
    expect(result.activationLink).toContain("http://localhost:5173/confirmar-email?token=");
    const htmlArg = mailProvider.send.mock.calls[0][0].html as string;
    expect(htmlArg).toContain(result.activationLink);
    expect(htmlArg).toContain("João");
  });
});
