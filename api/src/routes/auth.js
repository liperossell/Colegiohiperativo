import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(128),
  remember_me: z.boolean().optional().default(false),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "E-mail ou senha inválidos.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;
  const jwtSecret = process.env.JWT_SECRET || "hiperativo-dev-secret";

  try {
    const result = await query(
      `SELECT id, full_name, email, phone, cpf, user_type, password_hash, email_verified
       FROM usuarios
       WHERE email = $1
       LIMIT 1`,
      [data.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        message: "Conta pendente de ativação. Verifique seu e-mail para confirmar o cadastro.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const expiresIn = data.remember_me ? "30d" : "7d";
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        user_type: user.user_type,
      },
      jwtSecret,
      { expiresIn }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno ao autenticar." });
  }
});

export default router;
