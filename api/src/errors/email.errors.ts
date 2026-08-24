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
