import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";

import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

// Cookies <--> Formas da gente manter context entre requisições

// Unitarios: unidade de sua aplicação
// Integração: Comunicação entre duas ou mais unidades
// e2e: ponta a ponta: simula um usuário operando na nossa aplicação

// front-end: abre a página de login, digite o texto emerson.dantaspereira@hotmail.com no campo com10 email, clique no botão
// back-end: chamadas HTTP, WebSockets

// Pirâmide de testes: E2E (não depender de nenhuma tecnologia, não dependem de arquitetura)

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const transaction = await knex("transactions")
        .where({ session_id: sessionId, id })
        .first();

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("ammount", { as: "ammount" })
        .first();

      return { summary };
    }
  );

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      ammount: z.number(),
      type: z.enum(["credit", "debit"]).default("credit"),
    });

    const { title, ammount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      ammount: type === "credit" ? ammount : ammount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
