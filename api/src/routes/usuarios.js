import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db.js";
import {
  ACTIVATION_TOKEN_SECRET,
  ACTIVATION_TOKEN_TTL_HOURS,
  EMAIL_SERVICE_API_KEY,
  EMAIL_SERVICE_APP,
  EMAIL_SERVICE_URL,
  FRONTEND_URL,
} from "../config/env.ts";
import {
  buildActivationLink,
  createActivationToken,
} from "../services/crypto/activation-token.service.ts";
import { sendTemplateEmail } from "../../../../infra/api-contract/email-client.js";
import {
  buildProtocolo,
  buildSubmissionError,
  buildSubmissionSuccess,
} from "../../../../infra/api-contract/submission-response.js";

const router = Router();

const usuarioSchema = z.object({
  full_name: z.string().trim().min(3).max(200),
  email: z.string().trim().email().max(160),
  phone: z.string().regex(/^\d{10,11}$/),
  cpf: z.string().regex(/^\d{11}$/),
  password: z.string().min(8).max(128),
  user_type: z.enum(["aluno", "responsavel", "professor", "funcionario"]),
  accept_terms: z.literal(true),
});

/**
 * Gera link de ativação criptografado para o usuário recém-cadastrado.
 * @param userId Identificador UUID do usuário.
 * @param email E-mail do usuário usado na validação do token.
 */
function createActivationLinkForUser(userId, email) {
  const token = createActivationToken(
    { userId, email: email.toLowerCase() },
    ACTIVATION_TOKEN_SECRET,
    ACTIVATION_TOKEN_TTL_HOURS
  );

  return buildActivationLink(FRONTEND_URL, token);
}

router.post("/", async (req, res) => {
  const parsed = usuarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(
      buildSubmissionError({
        message: "Dados inválidos. Revise o formulário de cadastro.",
        code: "VALIDATION_ERROR",
        errors: parsed.error.flatten().fieldErrors,
      })
    );
  }

  const data = parsed.data;
  const protocolo = buildProtocolo("HP");

  try {
    const existing = await query(
      `SELECT id FROM usuarios WHERE email = $1 OR cpf = $2 LIMIT 1`,
      [data.email.toLowerCase(), data.cpf]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json(
        buildSubmissionError({
          message: "E-mail ou CPF já cadastrado.",
          code: "DUPLICATE_ENTRY",
        })
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await query(
      `INSERT INTO usuarios (
        protocolo, full_name, email, phone, cpf, password_hash, user_type, accept_terms, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
      RETURNING id, protocolo, created_at`,
      [
        protocolo,
        data.full_name,
        data.email.toLowerCase(),
        data.phone,
        data.cpf,
        passwordHash,
        data.user_type,
        data.accept_terms,
      ]
    );

    const user = result.rows[0];
    const activationLink = createActivationLinkForUser(user.id, data.email.toLowerCase());

    try {
      await sendTemplateEmail({
        baseUrl: EMAIL_SERVICE_URL,
        apiKey: EMAIL_SERVICE_API_KEY,
        app: EMAIL_SERVICE_APP,
        to: data.email.toLowerCase(),
        template: "account-activation",
        subject: "Ative sua conta no Colégio Hiperativo",
        variables: {
          fullName: data.full_name,
          activationLink,
        },
      });

      return res.status(201).json(
        buildSubmissionSuccess({
          id: user.id,
          protocolo: user.protocolo,
          createdAt: user.created_at,
          message: "Conta criada com sucesso. Verifique seu e-mail para ativar a conta.",
          meta: {
            activation_link: activationLink,
          },
        })
      );
    } catch (emailError) {
      console.error("Erro ao enviar e-mail de ativação:", emailError);

      return res.status(502).json(
        buildSubmissionSuccess({
          id: user.id,
          protocolo: user.protocolo,
          createdAt: user.created_at,
          message:
            "Conta criada, mas não foi possível enviar o e-mail de ativação. Use o link abaixo para ativar a conta.",
          meta: {
            activation_link: activationLink,
          },
        })
      );
    }
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json(
      buildSubmissionError({
        message: "Erro interno ao criar a conta.",
        code: "INTERNAL_ERROR",
      })
    );
  }
});

export default router;
