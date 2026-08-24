import crypto from "node:crypto";
import { InvalidActivationTokenError } from "../../errors/email.errors.js";

/** Payload criptografado embutido no link de ativação de conta. */
export interface ActivationTokenPayload {
  userId: string;
  email: string;
  exp: number;
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Deriva chave simétrica a partir do segredo configurado no ambiente.
 * @param secret Segredo usado para criptografar tokens de ativação.
 */
function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, "hiperativo-activation-salt", 32);
}

/**
 * Cria token criptografado para link de ativação de conta.
 * @param data Identificador do usuário e e-mail a serem embutidos no token.
 * @param secret Segredo de criptografia.
 * @param ttlHours Tempo de validade do token em horas.
 */
export function createActivationToken(
  data: Pick<ActivationTokenPayload, "userId" | "email">,
  secret: string,
  ttlHours: number
): string {
  const payload: ActivationTokenPayload = {
    ...data,
    exp: Date.now() + ttlHours * 60 * 60 * 1000,
  };

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

/**
 * Decodifica e valida token criptografado de ativação de conta.
 * @param token Token recebido via query string do link de ativação.
 * @param secret Segredo de criptografia.
 */
export function decryptActivationToken(
  token: string,
  secret: string
): ActivationTokenPayload {
  try {
    const buffer = Buffer.from(token, "base64url");
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(secret), iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
      "utf8"
    );
    const payload = JSON.parse(decrypted) as ActivationTokenPayload;

    if (!payload.userId || !payload.email || !payload.exp) {
      throw new InvalidActivationTokenError("Token de ativação inválido.");
    }

    if (payload.exp < Date.now()) {
      throw new InvalidActivationTokenError("Token de ativação expirado.");
    }

    return payload;
  } catch (error) {
    if (error instanceof InvalidActivationTokenError) {
      throw error;
    }

    throw new InvalidActivationTokenError("Token de ativação inválido.");
  }
}

/**
 * Monta URL pública de ativação com token criptografado.
 * @param frontendUrl URL base do frontend.
 * @param token Token criptografado gerado para o usuário.
 */
export function buildActivationLink(frontendUrl: string, token: string): string {
  const base = frontendUrl.replace(/\/$/, "");
  return `${base}/confirmar-email?token=${encodeURIComponent(token)}`;
}
