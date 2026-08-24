import { z } from "zod";

/** Variáveis dinâmicas injetadas no template HTML do e-mail. */
export type EmailTemplateVariables = Record<string, string>;

/** Payload criptografado embutido no link de ativação de conta. */
export interface ActivationTokenPayload {
  userId: string;
  email: string;
  exp: number;
}

/** Contrato da requisição para envio de e-mail com template. */
export const sendEmailRequestSchema = z.object({
  to: z.string().trim().email().max(160),
  template: z.string().trim().min(1).max(80),
  subject: z.string().trim().min(1).max(200).optional(),
  variables: z.record(z.string()).default({}),
});

export type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>;

/** Contrato da requisição para envio de link de ativação de conta. */
export const sendActivationEmailRequestSchema = sendEmailRequestSchema.extend({
  userId: z.string().uuid(),
});

export type SendActivationEmailRequest = z.infer<typeof sendActivationEmailRequestSchema>;

/** Resposta de sucesso no envio de e-mail. */
export interface SendEmailSuccessResponse {
  ok: true;
  message: string;
  sentTo: string;
  template: string;
}

/** Resposta de sucesso no envio de e-mail de ativação de conta. */
export interface SendActivationEmailSuccessResponse extends SendEmailSuccessResponse {
  activationLink: string;
}

/** Resposta padronizada de erro da API de e-mails. */
export interface SendEmailErrorResponse {
  ok: false;
  code:
    | "VALIDATION_ERROR"
    | "TEMPLATE_NOT_FOUND"
    | "TEMPLATE_INJECTION_ERROR"
    | "EMAIL_PROVIDER_ERROR"
    | "INTERNAL_ERROR";
  message: string;
  details?: Record<string, string[] | string>;
}
