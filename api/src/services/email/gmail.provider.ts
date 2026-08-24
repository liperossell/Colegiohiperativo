import { google } from "googleapis";
import {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER,
  isGmailConfigured,
} from "../../config/env.js";
import { EmailProviderError } from "../../errors/email.errors.js";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface MailProvider {
  send(message: MailMessage): Promise<void>;
}

/**
 * Codifica assunto UTF-8 no formato RFC 2047 para envio via Gmail API.
 * @param subject Assunto legível do e-mail.
 */
function encodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}

/**
 * Monta mensagem MIME base64url compatível com Gmail API.
 * @param message Dados do e-mail a ser enviado.
 */
function buildRawMessage(message: MailMessage): string {
  const mime = [
    `From: ${GMAIL_USER}`,
    `To: ${message.to}`,
    `Subject: ${encodeSubject(message.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    message.html,
  ].join("\r\n");

  return Buffer.from(mime)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Provedor de envio via Gmail API usando OAuth2 e refresh token.
 */
export class GmailProvider implements MailProvider {
  /**
   * Envia e-mail HTML usando a Gmail API.
   * @param message Destinatário, assunto e corpo HTML.
   */
  async send(message: MailMessage): Promise<void> {
    if (!isGmailConfigured()) {
      throw new EmailProviderError(
        "Gmail não configurado. Defina GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN e GMAIL_USER."
      );
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        GMAIL_REDIRECT_URI
      );

      oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: buildRawMessage(message),
        },
      });
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Erro desconhecido ao enviar e-mail.";
      throw new EmailProviderError(`Falha ao enviar e-mail via Gmail: ${reason}`, error);
    }
  }
}

/**
 * Provedor de desenvolvimento que apenas registra o e-mail no console.
 */
export class ConsoleMailProvider implements MailProvider {
  /**
   * Simula envio de e-mail escrevendo o conteúdo no log da aplicação.
   * @param message Dados do e-mail simulado.
   */
  async send(message: MailMessage): Promise<void> {
    console.log("[email:dev]", {
      to: message.to,
      subject: message.subject,
      htmlPreview: message.html.slice(0, 180),
    });
  }
}

/**
 * Seleciona provedor real ou de desenvolvimento conforme variáveis de ambiente.
 */
export function createMailProvider(): MailProvider {
  return isGmailConfigured() ? new GmailProvider() : new ConsoleMailProvider();
}
