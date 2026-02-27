import Fastify, { type FastifyInstance } from "fastify";
import { TodoStore } from "./store.js";
import { todosRoutes } from "./routes/todos.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  const store = new TodoStore();

  app.register((instance, _opts, done) => {
    todosRoutes(instance, store);
    done();
  });

  return app;
}
