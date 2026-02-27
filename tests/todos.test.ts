import { describe, it, expect, beforeEach } from "vitest";
import { buildApp } from "../src/app.js";

describe("API Todos - Tests d'intégration", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  describe("GET /todos", () => {
    it("retourne une liste vide initialement", async () => {
      const response = await app.inject({ method: "GET", url: "/todos" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it("retourne tous les todos créés", async () => {
      await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Premier todo" },
      });
      await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Deuxième todo" },
      });

      const response = await app.inject({ method: "GET", url: "/todos" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(2);
    });
  });

  describe("GET /todos/:id", () => {
    it("retourne un todo existant", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Mon todo" },
      });
      const { id } = created.json();

      const response = await app.inject({ method: "GET", url: `/todos/${id}` });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ id, title: "Mon todo", completed: false });
    });

    it("retourne 404 pour un id inexistant", async () => {
      const response = await app.inject({ method: "GET", url: "/todos/999" });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Todo non trouvé" });
    });
  });

  describe("POST /todos", () => {
    it("crée un todo avec un titre valide", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Acheter du lait" },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        title: "Acheter du lait",
        completed: false,
      });
      expect(response.json()).toHaveProperty("id");
      expect(response.json()).toHaveProperty("createdAt");
    });

    it("trim le titre", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "  Todo avec espaces  " },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().title).toBe("Todo avec espaces");
    });

    it("retourne 400 si le titre est manquant", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/todos",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it("retourne 400 si le titre est une chaîne vide", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "   " },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: "Le titre est requis" });
    });
  });

  describe("PATCH /todos/:id", () => {
    it("met à jour le titre d'un todo", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Ancien titre" },
      });
      const { id } = created.json();

      const response = await app.inject({
        method: "PATCH",
        url: `/todos/${id}`,
        payload: { title: "Nouveau titre" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ id, title: "Nouveau titre" });
    });

    it("marque un todo comme complété", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Tâche à faire" },
      });
      const { id } = created.json();

      const response = await app.inject({
        method: "PATCH",
        url: `/todos/${id}`,
        payload: { completed: true },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ id, completed: true });
    });

    it("met à jour titre et completed simultanément", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Tâche initiale" },
      });
      const { id } = created.json();

      const response = await app.inject({
        method: "PATCH",
        url: `/todos/${id}`,
        payload: { title: "Tâche terminée", completed: true },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ title: "Tâche terminée", completed: true });
    });

    it("retourne 404 pour un id inexistant", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/todos/999",
        payload: { completed: true },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Todo non trouvé" });
    });

    it("retourne 400 si le titre de mise à jour est vide", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "Todo" },
      });
      const { id } = created.json();

      const response = await app.inject({
        method: "PATCH",
        url: `/todos/${id}`,
        payload: { title: "" },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: "Le titre ne peut pas être vide" });
    });
  });

  describe("DELETE /todos/:id", () => {
    it("supprime un todo existant", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/todos",
        payload: { title: "À supprimer" },
      });
      const { id } = created.json();

      const deleteResponse = await app.inject({ method: "DELETE", url: `/todos/${id}` });
      expect(deleteResponse.statusCode).toBe(204);

      const getResponse = await app.inject({ method: "GET", url: `/todos/${id}` });
      expect(getResponse.statusCode).toBe(404);
    });

    it("retourne 404 pour un id inexistant", async () => {
      const response = await app.inject({ method: "DELETE", url: "/todos/999" });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Todo non trouvé" });
    });
  });
});
