import type { FastifyInstance } from "fastify";
import type { TodoStore } from "../store.js";
import type { CreateTodoBody, TodoParams, UpdateTodoBody } from "../types.js";

export async function todosRoutes(fastify: FastifyInstance, store: TodoStore): Promise<void> {
  // GET /todos
  fastify.get("/todos", async (_request, reply) => {
    return reply.code(200).send(store.getAll());
  });

  // GET /todos/:id
  fastify.get<{ Params: TodoParams }>("/todos/:id", async (request, reply) => {
    const todo = store.getById(request.params.id);
    if (!todo) {
      return reply.code(404).send({ error: "Todo non trouvé" });
    }
    return reply.code(200).send(todo);
  });

  // POST /todos
  fastify.post<{ Body: CreateTodoBody }>("/todos", async (request, reply) => {
    const { title } = request.body;
    if (!title || title.trim() === "") {
      return reply.code(400).send({ error: "Le titre est requis" });
    }
    const todo = store.create(title.trim());
    return reply.code(201).send(todo);
  });

  // PATCH /todos/:id
  fastify.patch<{ Params: TodoParams; Body: UpdateTodoBody }>(
    "/todos/:id",
    async (request, reply) => {
      const { title, completed } = request.body;
      if (title !== undefined && title.trim() === "") {
        return reply.code(400).send({ error: "Le titre ne peut pas être vide" });
      }
      const todo = store.update(request.params.id, {
        title: title?.trim(),
        completed,
      });
      if (!todo) {
        return reply.code(404).send({ error: "Todo non trouvé" });
      }
      return reply.code(200).send(todo);
    }
  );

  // DELETE /todos/:id
  fastify.delete<{ Params: TodoParams }>("/todos/:id", async (request, reply) => {
    const deleted = store.delete(request.params.id);
    if (!deleted) {
      return reply.code(404).send({ error: "Todo non trouvé" });
    }
    return reply.code(204).send();
  });
}
