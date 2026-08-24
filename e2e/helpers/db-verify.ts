import pg from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://hiperativo:hiperativo@localhost:5433/hiperativo';

export interface UsuarioRecord {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  user_type: string;
}

export interface MatriculaRecord {
  id: string;
  protocolo: string;
  full_name: string;
  email: string;
  cpf: string;
  course_name: string;
}

/**
 * Executa query parametrizada no PostgreSQL de testes.
 * @param text - SQL com placeholders.
 * @param params - Valores dos parâmetros.
 */
async function query<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  try {
    const result = await pool.query<T>(text, params);
    return result.rows;
  } finally {
    await pool.end();
  }
}

/**
 * Busca usuário cadastrado pelo e-mail informado.
 * @param email - E-mail usado no formulário de cadastro.
 */
export async function findUsuarioByEmail(email: string): Promise<UsuarioRecord | null> {
  const rows = await query<UsuarioRecord>(
    `SELECT id, full_name, email, cpf, user_type
     FROM usuarios
     WHERE email = $1
     LIMIT 1`,
    [email.toLowerCase()],
  );

  return rows[0] ?? null;
}

/**
 * Busca matrícula registrada pelo e-mail informado.
 * @param email - E-mail usado no formulário de matrícula.
 */
export async function findMatriculaByEmail(email: string): Promise<MatriculaRecord | null> {
  const rows = await query<MatriculaRecord>(
    `SELECT id, protocolo, full_name, email, cpf, course_name
     FROM matriculas
     WHERE email = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [email.toLowerCase()],
  );

  return rows[0] ?? null;
}

/**
 * Aguarda registro aparecer no banco após submissão do formulário.
 * @param finder - Função que consulta o banco.
 * @param retries - Número máximo de tentativas.
 * @param delayMs - Intervalo entre tentativas.
 */
export async function waitForDbRecord<T>(
  finder: () => Promise<T | null>,
  retries = 15,
  delayMs = 500,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const record = await finder();
    if (record) return record;

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Registro não encontrado no banco de dados após submissão.');
}
