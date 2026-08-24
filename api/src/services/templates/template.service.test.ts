import { describe, expect, it } from "vitest";
import { TemplateInjectionError } from "../../errors/email.errors.js";
import { injectTemplateVariables, loadTemplate } from "./template.service.js";

describe("template.service", () => {
  it("carrega template account-activation existente", async () => {
    const template = await loadTemplate("account-activation");
    expect(template).toContain("{{fullName}}");
    expect(template).toContain("{{activationLink}}");
  });

  it("lança erro quando template não existe", async () => {
    await expect(loadTemplate("inexistente")).rejects.toMatchObject({
      code: "TEMPLATE_NOT_FOUND",
    });
  });

  it("injeta variáveis no template", () => {
    const html = "<p>Olá {{fullName}}, link: {{activationLink}}</p>";
    const rendered = injectTemplateVariables(html, {
      fullName: "Maria",
      activationLink: "https://exemplo.com/ativar?token=abc",
    });

    expect(rendered).toContain("Maria");
    expect(rendered).toContain("https://exemplo.com/ativar?token=abc");
    expect(rendered).not.toContain("{{");
  });

  it("lança erro quando variável obrigatória do template não é informada", () => {
    const html = "<p>{{fullName}}</p>";

    expect(() =>
      injectTemplateVariables(html, {})
    ).toThrow(TemplateInjectionError);
  });
});
