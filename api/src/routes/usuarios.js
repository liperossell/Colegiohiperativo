import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db.js";
import { emailService } from "../services/email/email.service.ts";

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

router.post("/", async (req, res) => {
  const parsed = usuarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos. Revise o formulário de cadastro.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;

  try {
    const existing = await query(
      `SELECT id FROM usuarios WHERE email = $1 OR cpf = $2 LIMIT 1`,
      [data.email.toLowerCase(), data.cpf]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "E-mail ou CPF já cadastrado.",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await query(
      `INSERT INTO usuarios (
        full_name, email, phone, cpf, password_hash, user_type, accept_terms, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
      RETURNING id, full_name, email, user_type, email_verified, created_at`,
      [
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

    try {
      const emailResult = await emailService.sendAccountActivationEmail({
        to: user.email,
        template: "account-activation",
        userId: user.id,
        variables: {
          fullName: user.full_name,
        },
      });

      return res.status(201).json({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        user_type: user.user_type,
        email_verified: user.email_verified,
        created_at: user.created_at,
        activation_link: emailResult.activationLink,
        message: "Conta criada com sucesso. Verifique seu e-mail para ativar a conta.",
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail de ativação:", emailError);
      const activationLink = emailService.createActivationLinkForUser(user.id, user.email);

      return res.status(502).json({
        message:
          "Conta criada, mas não foi possível enviar o e-mail de ativação. Use o link abaixo para ativar a conta.",
        userId: user.id,
        activation_link: activationLink,
      });
    }
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ message: "Erro interno ao criar a conta." });
  }
});

export default router;
