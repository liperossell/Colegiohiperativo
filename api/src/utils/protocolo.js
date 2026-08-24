/**
 * Gera protocolo único para matrículas do Hiperativo.
 * @param {string} prefix - Prefixo do protocolo (ex.: HP).
 */
export function buildProtocolo(prefix = "HP") {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${y}${m}${d}${rand}`;
}
