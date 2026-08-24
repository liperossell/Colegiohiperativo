import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { buildProtocolo } from "../utils/protocolo.js";
import {
  buildSubmissionError,
  buildSubmissionSuccess,
} from "../../../../infra/api-contract/submission-response.js";

const router = Router();

const guardianSchema = z.object({
  name: z.string().trim().min(2).max(200),
  cpf: z.string().regex(/^\d{11}$/),
  phone: z.string().regex(/^\d{10,11}$/),
  email: z.string().trim().email().max(160),
  relationship: z.string().trim().min(2).max(40),
});

const matriculaSchema = z.object({
  full_name: z.string().trim().min(3).max(200),
  social_name: z.string().trim().max(200).optional().default(""),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.string().trim().min(1).max(20),
  cpf: z.string().regex(/^\d{11}$/),
  rg: z.string().trim().max(30).optional().default(""),
  nationality: z.string().trim().max(60).optional().default("Brasileira"),
  birth_place: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(160),
  phone: z.string().regex(/^\d{10,11}$/),
  whatsapp: z.union([z.string().regex(/^\d{10,11}$/), z.literal("")]).optional().default(""),
  address_cep: z.string().regex(/^\d{8}$/),
  address_street: z.string().trim().min(2).max(180),
  address_number: z.string().trim().min(1).max(20),
  address_complement: z.string().trim().max(120).optional().default(""),
  address_neighborhood: z.string().trim().min(2).max(120),
  address_city: z.string().trim().min(2).max(120),
  address_state: z.string().length(2),
  course_level: z.string().trim().min(2).max(40),
  course_name: z.string().trim().min(2).max(120),
  shift: z.string().trim().min(2).max(20),
  previous_school: z.string().trim().max(200).optional().default(""),
  year_of_completion: z.string().trim().max(10).optional().default(""),
  guardian: guardianSchema.nullable().optional(),
  sports_interests: z.array(z.string().trim().max(40)).optional().default([]),
  special_needs: z.string().trim().max(4000).optional().default(""),
  medical_info: z.string().trim().max(4000).optional().default(""),
  how_found_us: z.string().trim().max(40).optional().default(""),
  observations: z.string().trim().max(4000).optional().default(""),
  accept_terms: z.literal(true),
  accept_privacy: z.literal(true),
  accept_marketing: z.boolean().optional().default(false),
});

router.post("/", async (req, res) => {
  const parsed = matriculaSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(
      buildSubmissionError({
        message: "Dados inválidos. Revise o formulário de matrícula.",
        code: "VALIDATION_ERROR",
        errors: parsed.error.flatten().fieldErrors,
      })
    );
  }

  const data = parsed.data;
  const protocolo = buildProtocolo("HP");
  const guardianJson = data.guardian ? JSON.stringify(data.guardian) : null;

  try {
    const result = await query(
      `INSERT INTO matriculas (
        protocolo, full_name, social_name, birth_date, gender, cpf, rg,
        nationality, birth_place, email, phone, whatsapp,
        address_cep, address_street, address_number, address_complement,
        address_neighborhood, address_city, address_state,
        course_level, course_name, shift, previous_school, year_of_completion,
        guardian, sports_interests, special_needs, medical_info,
        how_found_us, observations, accept_terms, accept_privacy, accept_marketing
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19,
        $20, $21, $22, $23, $24,
        $25, $26, $27, $28,
        $29, $30, $31, $32, $33
      )
      RETURNING id, protocolo, created_at`,
      [
        protocolo,
        data.full_name,
        data.social_name || null,
        data.birth_date,
        data.gender,
        data.cpf,
        data.rg || null,
        data.nationality || null,
        data.birth_place || null,
        data.email.toLowerCase(),
        data.phone,
        data.whatsapp || null,
        data.address_cep,
        data.address_street,
        data.address_number,
        data.address_complement || null,
        data.address_neighborhood,
        data.address_city,
        data.address_state.toUpperCase(),
        data.course_level,
        data.course_name,
        data.shift,
        data.previous_school || null,
        data.year_of_completion || null,
        guardianJson,
        data.sports_interests,
        data.special_needs || null,
        data.medical_info || null,
        data.how_found_us || null,
        data.observations || null,
        data.accept_terms,
        data.accept_privacy,
        data.accept_marketing,
      ]
    );

    const row = result.rows[0];
    return res.status(201).json(
      buildSubmissionSuccess({
        id: row.id,
        protocolo: row.protocolo,
        createdAt: row.created_at,
        message: "Matrícula registrada com sucesso.",
      })
    );
  } catch (error) {
    console.error("Erro ao salvar matrícula:", error);
    return res.status(500).json(
      buildSubmissionError({
        message: "Erro interno ao salvar a matrícula.",
        code: "INTERNAL_ERROR",
      })
    );
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT id, protocolo, full_name, email, phone, course_name, shift, created_at
       FROM matriculas
       WHERE id::text = $1 OR protocolo = $1
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Matrícula não encontrada." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar matrícula:", error);
    return res.status(500).json({ message: "Erro interno ao buscar a matrícula." });
  }
});

export default router;
