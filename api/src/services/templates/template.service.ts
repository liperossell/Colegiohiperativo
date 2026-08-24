import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TemplateInjectionError, TemplateNotFoundError } from "../../errors/email.errors.js";
import type { EmailTemplateVariables } from "../../types/email.types.js";

const templatesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../templates"
);

/**
 * Carrega conteúdo HTML de um template pelo nome informado.
 * @param template Nome do arquivo de template sem extensão.
 */
export async function loadTemplate(template: string): Promise<string> {
  const safeName = template.replace(/[^a-zA-Z0-9-_]/g, "");
  const filePath = path.join(templatesDir, `${safeName}.html`);

  try {
    return await readFile(filePath, "utf8");
  } catch {
    throw new TemplateNotFoundError(template);
  }
}

/**
 * Injeta variáveis em placeholders `{{variavel}}` do template HTML.
 * @param template Conteúdo HTML bruto do template.
 * @param variables Mapa de variáveis informadas na requisição.
 */
export function injectTemplateVariables(
  template: string,
  variables: EmailTemplateVariables
): string {
  const placeholders = [...template.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]);
  const uniquePlaceholders = [...new Set(placeholders)];

  for (const key of uniquePlaceholders) {
    const value = variables[key];
    if (value === undefined || value.trim() === "") {
      throw new TemplateInjectionError(
        `Não foi possível injetar a variável "{{${key}}}" no template.`
      );
    }
  }

  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }

  const remaining = rendered.match(/\{\{(\w+)\}\}/g);
  if (remaining?.length) {
    throw new TemplateInjectionError(
      `Placeholders não preenchidos: ${remaining.join(", ")}`
    );
  }

  return rendered;
}

export const templateService = {
  loadTemplate,
  injectTemplateVariables,
};
