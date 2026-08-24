import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const infraDir = path.resolve(projectRoot, "..", "infra");
const composeFile = path.join(infraDir, "docker-compose.yml");
const legacyComposeFile = path.join(infraDir, "postgres", "docker-compose.yml");

const primaryRepo =
  process.env.FILHAO_INFRA_REPO ?? "https://github.com/JorgeRamalho/infra.git";
const fallbackRepo =
  process.env.FILHAO_INFRA_REPO_FALLBACK ??
  "https://github.com/liperossell/filhao-infra.git";

/**
 * Clona o repositório de infra ao lado do app quando ainda não existe localmente.
 * @param repoUrl URL HTTPS do repositório Git.
 */
function cloneInfra(repoUrl) {
  console.log(`[ensure-infra] Clonando ${repoUrl} em ${infraDir}`);
  execSync(`git clone ${repoUrl} "${infraDir}"`, { stdio: "inherit" });
}

if (existsSync(composeFile) || existsSync(legacyComposeFile)) {
  console.log("[ensure-infra] Infra local detectada em", infraDir);
  process.exit(0);
}

if (existsSync(infraDir)) {
  console.log("[ensure-infra] Pasta infra existe sem compose reconhecido. Usando infra local.");
  process.exit(0);
}

try {
  cloneInfra(primaryRepo);
} catch (error) {
  if (primaryRepo === fallbackRepo) {
    throw error;
  }

  console.warn(
    `[ensure-infra] Falha ao clonar ${primaryRepo}. Tentando fallback ${fallbackRepo}...`
  );
  cloneInfra(fallbackRepo);
}

if (!existsSync(composeFile) && !existsSync(legacyComposeFile)) {
  throw new Error(
    "Infra clonada, mas nenhum docker-compose.yml foi encontrado. Verifique o repositório."
  );
}

console.log("[ensure-infra] Infra pronta em", infraDir);
