import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { ACTIVATION_TOKEN_SECRET } from "../config/env.js";
import { decryptActivationToken } from "../services/crypto/activation-token.service.js";
import { InvalidActivationTokenError } from "../errors/email.errors.js";

const router = Router();

const verifyEmailQuerySchema = z.object({
  token: z.string().trim().min(10),
});

/**
 * GET /api/auth/verify-email?token=
 * Ativa conta do usuário a partir do token criptografado enviado por e-mail.
 */
router.get("/verify-email", async (req, res) => {
  const parsed = verifyEmailQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Token de ativação inválido.",
    });
  }

  try {
    const payload = decryptActivationToken(parsed.data.token, ACTIVATION_TOKEN_SECRET);

    const result = await query(
      `UPDATE usuarios
       SET email_verified = TRUE,
           email_verified_at = NOW()
       WHERE id = $1 AND email = $2 AND email_verified = FALSE
       RETURNING id, email, full_name, email_verified`,
      [payload.userId, payload.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      const existing = await query(
        `SELECT id, email, full_name, email_verified
         FROM usuarios
         WHERE id = $1 AND email = $2
         LIMIT 1`,
        [payload.userId, payload.email.toLowerCase()]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          code: "USER_NOT_FOUND",
          message: "Usuário não encontrado para este token.",
        });
      }

      if (existing.rows[0].email_verified) {
        return res.status(200).json({
          ok: true,
          alreadyActivated: true,
          message: "Sua conta já está ativada. Faça login para continuar.",
          user: existing.rows[0],
        });
      }

      return res.status(500).json({
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Não foi possível concluir a ativação da conta.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Conta ativada com sucesso.",
      user: result.rows[0],
    });
  } catch (error) {
    if (error instanceof InvalidActivationTokenError) {
      return res.status(400).json({
        ok: false,
        code: "INVALID_ACTIVATION_TOKEN",
        message: error.message,
      });
    }

    console.error("Erro ao verificar e-mail:", error);
    return res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Erro interno ao ativar conta.",
    });
  }
});

export default router;
