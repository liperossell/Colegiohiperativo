import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT ?? 3001);
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
export const ACTIVATION_TOKEN_SECRET =
  process.env.ACTIVATION_TOKEN_SECRET ?? "hiperativo-activation-dev-secret";
export const ACTIVATION_TOKEN_TTL_HOURS = Number(process.env.ACTIVATION_TOKEN_TTL_HOURS ?? 24);

export const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? "";
export const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? "";
export const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN ?? "";
export const GMAIL_USER = process.env.GMAIL_USER ?? "";
export const GMAIL_REDIRECT_URI =
  process.env.GMAIL_REDIRECT_URI ?? "https://developers.google.com/oauthplayground";

/** Indica se as credenciais OAuth2 do Gmail estão configuradas. */
export function isGmailConfigured(): boolean {
  return Boolean(
    GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && GMAIL_USER
  );
}
