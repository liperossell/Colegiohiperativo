import { describe, expect, it } from "vitest";
import {
  createActivationToken,
  decryptActivationToken,
} from "./activation-token.service.js";

describe("activation-token.service", () => {
  const secret = "test-secret-key-for-activation";

  it("cria token criptografado que pode ser decodificado", () => {
    const token = createActivationToken(
      { userId: "11111111-1111-1111-1111-111111111111", email: "aluno@test.com" },
      secret,
      24
    );

    expect(token).toBeTruthy();
    expect(token).not.toContain("aluno@test.com");

    const payload = decryptActivationToken(token, secret);
    expect(payload.userId).toBe("11111111-1111-1111-1111-111111111111");
    expect(payload.email).toBe("aluno@test.com");
    expect(payload.exp).toBeGreaterThan(Date.now());
  });

  it("rejeita token expirado", () => {
    const token = createActivationToken(
      { userId: "11111111-1111-1111-1111-111111111111", email: "aluno@test.com" },
      secret,
      -1
    );

    expect(() => decryptActivationToken(token, secret)).toThrow(/expirado/i);
  });

  it("rejeita token adulterado", () => {
    const token = createActivationToken(
      { userId: "11111111-1111-1111-1111-111111111111", email: "aluno@test.com" },
      secret,
      24
    );

    const tampered = `${token.slice(0, -4)}xxxx`;
    expect(() => decryptActivationToken(tampered, secret)).toThrow(/inválido/i);
  });
});
