import { Router, type Request, type Response } from "express";
import {
  EmailProviderError,
  InvalidActivationTokenError,
  TemplateInjectionError,
  TemplateNotFoundError,
} from "../errors/email.errors.js";
import type { SendEmailErrorResponse } from "../types/email.types.js";
import {
  sendActivationEmailRequestSchema,
  sendEmailRequestSchema,
} from "../types/email.types.js";
import type { EmailService } from "../services/email/email.service.js";
import { emailService as defaultEmailService } from "../services/email/email.service.js";

/**
 * Converte exceções de domínio em resposta HTTP padronizada.
 * @param error Erro capturado durante o envio de e-mail.
 * @param res Objeto de resposta Express.
 */
function handleEmailError(error: unknown, res: Response): Response {
  if (error instanceof TemplateNotFoundError) {
    const body: SendEmailErrorResponse = {
      ok: false,
      code: "TEMPLATE_NOT_FOUND",
      message: error.message,
    };
    return res.status(404).json(body);
  }

  if (error instanceof TemplateInjectionError) {
    const body: SendEmailErrorResponse = {
      ok: false,
      code: "TEMPLATE_INJECTION_ERROR",
      message: error.message,
    };
    return res.status(422).json(body);
  }

  if (error instanceof EmailProviderError) {
    const body: SendEmailErrorResponse = {
      ok: false,
      code: "EMAIL_PROVIDER_ERROR",
      message: error.message,
    };
    return res.status(502).json(body);
  }

  console.error("Erro inesperado no envio de e-mail:", error);
  const body: SendEmailErrorResponse = {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "Erro interno ao processar envio de e-mail.",
  };
  return res.status(500).json(body);
}

/**
 * Cria router de e-mails com serviço injetável (útil para testes).
 * @param service Serviço responsável por renderizar templates e enviar e-mails.
 */
export function createEmailsRouter(service: EmailService = defaultEmailService): Router {
  const router = Router();

  /**
   * POST /api/emails/send
   * Envia e-mail usando template e variáveis informados na requisição.
   */
  router.post("/send", async (req: Request, res: Response) => {
    const parsed = sendEmailRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: SendEmailErrorResponse = {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Payload inválido para envio de e-mail.",
        details: parsed.error.flatten().fieldErrors,
      };
      return res.status(400).json(body);
    }

    try {
      const result = await service.sendTemplatedEmail(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      return handleEmailError(error, res);
    }
  });

  /**
   * POST /api/emails/account-activation
   * Gera link criptografado e envia e-mail de ativação de conta.
   */
  router.post("/account-activation", async (req: Request, res: Response) => {
    const parsed = sendActivationEmailRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: SendEmailErrorResponse = {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Payload inválido para envio de ativação de conta.",
        details: parsed.error.flatten().fieldErrors,
      };
      return res.status(400).json(body);
    }

    try {
      const result = await service.sendAccountActivationEmail(parsed.data);
      return res.status(200).json({
        ...result,
        message: "E-mail de ativação enviado com sucesso.",
      });
    } catch (error) {
      return handleEmailError(error, res);
    }
  });

  return router;
}

export default createEmailsRouter();

export { InvalidActivationTokenError };
