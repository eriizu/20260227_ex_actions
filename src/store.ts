import type { Todo } from "./types.js";

// In-memory store — remplace par une DB en prod
export class TodoStore {
  private todos: Map<string, Todo> = new Map();
  private counter = 0;

  getAll(): Todo[] {
    return Array.from(this.todos.values());
  }

  getById(id: string): Todo | undefined {
    return this.todos.get(id);
  }

  create(title: string): Todo {
    const id = String(++this.counter);
    const todo: Todo = {
      id,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.todos.set(id, todo);
    return todo;
  }

  update(id: string, data: { title?: string; completed?: boolean }): Todo | undefined {
    const todo = this.todos.get(id);
    if (!todo) return undefined;

    const updated: Todo = { ...todo, ...data };
    this.todos.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.todos.delete(id);
  }

  clear(): void {
    this.todos.clear();
    this.counter = 0;
  }
}
