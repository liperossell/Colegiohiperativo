import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db.js";

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
        full_name, email, phone, cpf, password_hash, user_type, accept_terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name, email, user_type, created_at`,
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

    return res.status(201).json({
      id: result.rows[0].id,
      full_name: result.rows[0].full_name,
      email: result.rows[0].email,
      user_type: result.rows[0].user_type,
      created_at: result.rows[0].created_at,
      message: "Conta criada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ message: "Erro interno ao criar a conta." });
  }
});

export default router;
