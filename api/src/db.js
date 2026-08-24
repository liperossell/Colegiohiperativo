import pg from "pg";

const { Pool } = pg;

const schema = process.env.DB_SCHEMA || "hiperativo";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://filhao:filhao@localhost:5432/filhao_projetos",
  options: `-c search_path=${schema}`,
});

/**
 * Executa uma query SQL parametrizada no pool PostgreSQL.
 * @param {string} text - SQL com placeholders ($1, $2, ...).
 * @param {unknown[]} params - Valores dos parâmetros da query.
 */
export async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Aguarda o banco ficar disponível com tentativas periódicas.
 * @param {number} retries - Número máximo de tentativas.
 * @param {number} delayMs - Intervalo entre tentativas em milissegundos.
 */
export async function waitForDb(retries = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export default pool;
