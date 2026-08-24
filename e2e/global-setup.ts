import { execSync } from 'node:child_process';
import pg from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://hiperativo:hiperativo@localhost:5433/hiperativo';

/**
 * Sobe o container PostgreSQL e aguarda ficar pronto para os testes E2E.
 */
async function ensureDatabaseReady(): Promise<void> {
  try {
    execSync('docker compose up -d db', { cwd: process.cwd(), stdio: 'pipe' });
  } catch {
    // Container pode já estar em execução.
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  try {
    for (let attempt = 1; attempt <= 30; attempt += 1) {
      try {
        await pool.query('SELECT 1');
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error('PostgreSQL indisponível após 30 tentativas.');
  } finally {
    await pool.end();
  }
}

export default async function globalSetup(): Promise<void> {
  await ensureDatabaseReady();
}
