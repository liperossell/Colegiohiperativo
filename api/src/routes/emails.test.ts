import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { TemplateNotFoundError, EmailProviderError } from "../errors/email.errors.js";
import { createEmailsRouter } from "./emails.js";

describe("POST /api/emails/send", () => {
  it("retorna 200 quando envio é bem-sucedido", async () => {
    const emailService = {
      sendTemplatedEmail: vi.fn().mockResolvedValue({
        ok: true,
        message: "E-mail enviado.",
        sentTo: "aluno@test.com",
        template: "account-activation",
      }),
      sendAccountActivationEmail: vi.fn(),
    };

    const app = express();
    app.use(express.json());
    app.use("/api/emails", createEmailsRouter(emailService as never));

    const response = await request(app)
      .post("/api/emails/send")
      .send({
        to: "aluno@test.com",
        template: "account-activation",
        subject: "Ative sua conta",
        variables: { fullName: "João" },
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it("retorna 400 para payload inválido", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/emails", createEmailsRouter({} as never));

    const response = await request(app).post("/api/emails/send").send({ to: "invalido" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("retorna 404 quando template não existe", async () => {
    const emailService = {
      sendTemplatedEmail: vi.fn().mockRejectedValue(new TemplateNotFoundError("foo")),
      sendAccountActivationEmail: vi.fn(),
    };

    const app = express();
    app.use(express.json());
    app.use("/api/emails", createEmailsRouter(emailService as never));

    const response = await request(app)
      .post("/api/emails/send")
      .send({ to: "aluno@test.com", template: "foo", variables: {} });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("TEMPLATE_NOT_FOUND");
  });

  it("retorna 502 quando provedor falha", async () => {
    const emailService = {
      sendTemplatedEmail: vi
        .fn()
        .mockRejectedValue(new EmailProviderError("Falha ao enviar via Gmail")),
      sendAccountActivationEmail: vi.fn(),
    };

    const app = express();
    app.use(express.json());
    app.use("/api/emails", createEmailsRouter(emailService as never));

    const response = await request(app)
      .post("/api/emails/send")
      .send({
        to: "aluno@test.com",
        template: "account-activation",
        variables: { fullName: "João", activationLink: "https://x" },
      });

    expect(response.status).toBe(502);
    expect(response.body.code).toBe("EMAIL_PROVIDER_ERROR");
  });
});

describe("POST /api/emails/account-activation", () => {
  it("retorna 200 ao enviar link de ativação", async () => {
    const emailService = {
      sendTemplatedEmail: vi.fn(),
      sendAccountActivationEmail: vi.fn().mockResolvedValue({
        ok: true,
        message: "E-mail de ativação enviado.",
        sentTo: "aluno@test.com",
        template: "account-activation",
        activationLink: "http://localhost:5173/confirmar-email?token=abc",
      }),
    };

    const app = express();
    app.use(express.json());
    app.use("/api/emails", createEmailsRouter(emailService as never));

    const response = await request(app)
      .post("/api/emails/account-activation")
      .send({
        to: "aluno@test.com",
        template: "account-activation",
        userId: "11111111-1111-1111-1111-111111111111",
        variables: { fullName: "João" },
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
