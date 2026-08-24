import {
  ACTIVATION_TOKEN_SECRET,
  ACTIVATION_TOKEN_TTL_HOURS,
  FRONTEND_URL,
} from "../../config/env.js";
import {
  EmailProviderError,
  TemplateInjectionError,
  TemplateNotFoundError,
} from "../../errors/email.errors.js";
import type {
  EmailTemplateVariables,
  SendActivationEmailSuccessResponse,
  SendEmailSuccessResponse,
  SendActivationEmailRequest,
  SendEmailRequest,
} from "../../types/email.types.js";
import {
  buildActivationLink,
  createActivationToken,
} from "../crypto/activation-token.service.js";
import { createMailProvider, type MailProvider } from "./gmail.provider.js";
import { templateService } from "../templates/template.service.js";

interface TemplateLoader {
  loadTemplate(template: string): Promise<string>;
  injectTemplateVariables(template: string, variables: EmailTemplateVariables): string;
}

interface EmailServiceOptions {
  frontendUrl?: string;
  activationSecret?: string;
  activationTtlHours?: number;
}

const DEFAULT_SUBJECTS: Record<string, string> = {
  "account-activation": "Ative sua conta no Colégio Hiperativo",
};

/**
 * Orquestra renderização de templates e envio via provedor de e-mail.
 */
export class EmailService {
  private readonly frontendUrl: string;
  private readonly activationSecret: string;
  private readonly activationTtlHours: number;

  /**
   * @param templateLoader Serviço responsável por carregar e injetar templates.
   * @param mailProvider Provedor de envio (Gmail API ou console em dev).
   * @param options Configurações de URL e criptografia do link de ativação.
   */
  constructor(
    private readonly templateLoader: TemplateLoader,
    private readonly mailProvider: MailProvider,
    options: EmailServiceOptions = {}
  ) {
    this.frontendUrl = options.frontendUrl ?? FRONTEND_URL;
    this.activationSecret = options.activationSecret ?? ACTIVATION_TOKEN_SECRET;
    this.activationTtlHours = options.activationTtlHours ?? ACTIVATION_TOKEN_TTL_HOURS;
  }

  /**
   * Envia e-mail genérico com template e variáveis informadas na requisição.
   * @param request Contrato da API com destinatário, template e variáveis.
   */
  async sendTemplatedEmail(
    request: SendEmailRequest
  ): Promise<SendEmailSuccessResponse> {
    const templateContent = await this.templateLoader.loadTemplate(request.template);
    const html = this.templateLoader.injectTemplateVariables(
      templateContent,
      request.variables
    );
    const subject =
      request.subject ?? DEFAULT_SUBJECTS[request.template] ?? "Mensagem do Colégio Hiperativo";

    await this.mailProvider.send({
      to: request.to,
      subject,
      html,
    });

    return {
      ok: true,
      message: "E-mail enviado com sucesso.",
      sentTo: request.to,
      template: request.template,
    };
  }

  /**
   * Gera link criptografado de ativação para um usuário recém-cadastrado.
   * @param userId Identificador UUID do usuário.
   * @param email E-mail do usuário usado na validação do token.
   */
  createActivationLinkForUser(userId: string, email: string): string {
    const token = createActivationToken(
      { userId, email: email.toLowerCase() },
      this.activationSecret,
      this.activationTtlHours
    );

    return buildActivationLink(this.frontendUrl, token);
  }

  /**
   * Gera link criptografado de ativação e envia e-mail de confirmação de conta.
   * @param request Contrato com userId, template, destinatário e variáveis de conteúdo.
   */
  async sendAccountActivationEmail(
    request: SendActivationEmailRequest
  ): Promise<SendActivationEmailSuccessResponse> {
    const activationLink = this.createActivationLinkForUser(request.userId, request.to);
    const variables: EmailTemplateVariables = {
      ...request.variables,
      activationLink,
    };

    const result = await this.sendTemplatedEmail({
      to: request.to,
      template: request.template,
      subject: request.subject,
      variables,
    });

    return {
      ...result,
      activationLink,
    };
  }
}

export const emailService = new EmailService(templateService, createMailProvider());

export {
  TemplateNotFoundError,
  TemplateInjectionError,
  EmailProviderError,
};
