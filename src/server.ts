import cookie from "@fastify/cookie";
import fastify from "fastify";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

app.register(cookie);

app.addHook("preHandler", async (request, reply) => {
  console.log(`[${request.method}] ${request.url}`);
});

app.register(transactionsRoutes, {
  prefix: "transactions",
});

app
  .listen({
    port: env.PORT ?? 3334,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
