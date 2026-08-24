/** Erro de domínio quando o template informado não existe. */
export class TemplateNotFoundError extends Error {
  readonly code = "TEMPLATE_NOT_FOUND" as const;

  /**
   * @param template Nome do template solicitado na requisição.
   */
  constructor(template: string) {
    super(`Template "${template}" não encontrado.`);
    this.name = "TemplateNotFoundError";
  }
}

/** Erro de domínio quando variáveis não podem ser injetadas no template. */
export class TemplateInjectionError extends Error {
  readonly code = "TEMPLATE_INJECTION_ERROR" as const;

  /**
   * @param message Descrição do problema de injeção (placeholder ausente ou sobrando).
   */
  constructor(message: string) {
    super(message);
    this.name = "TemplateInjectionError";
  }
}

/** Erro de domínio quando o provedor Gmail falha ao enviar. */
export class EmailProviderError extends Error {
  readonly code = "EMAIL_PROVIDER_ERROR" as const;

  /**
   * @param message Mensagem de falha retornada ou derivada do provedor.
   * @param cause Erro original do Gmail API, quando disponível.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "EmailProviderError";
    this.cause = cause;
  }
}

/** Erro de domínio para token de ativação inválido ou expirado. */
export class InvalidActivationTokenError extends Error {
  readonly code = "INVALID_ACTIVATION_TOKEN" as const;

  /**
   * @param message Motivo da invalidação do token.
   */
  constructor(message: string) {
    super(message);
    this.name = "InvalidActivationTokenError";
  }
}
