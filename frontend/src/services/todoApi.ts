import type { Todo, TodoFilters, Pagination, TodoStats, FormData } from '../types.ts';

const BASE = '/api';

/** Throws an Error with the server's error message if response is not ok */
async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Có lỗi xảy ra từ máy chủ');
  return json as T;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ── Response shapes ────────────────────────────────────────────
export interface TodoListResponse {
  success: boolean;
  data: Todo[];
  pagination: Pagination;
}

export interface TodoItemResponse {
  success: boolean;
  data: Todo;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// ── API methods ────────────────────────────────────────────────
export const todoApi = {

  /** Fetch paginated/filtered todo list */
  async getTodos(filters: TodoFilters, page: number, limit: number): Promise<TodoListResponse> {
    const params = new URLSearchParams({
      q: filters.q,
      status: filters.status,
      category: filters.category,
      priority: filters.priority,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: page.toString(),
      limit: limit.toString(),
    });
    const res = await fetch(`${BASE}/todos?${params}`);
    return handleResponse<TodoListResponse>(res);
  },

  /** Fetch dashboard statistics */
  async getStats(): Promise<TodoStats> {
    const res = await fetch(`${BASE}/stats`);
    return handleResponse<TodoStats>(res);
  },

  /** Create a new todo */
  async createTodo(data: FormData): Promise<TodoItemResponse> {
    const res = await fetch(`${BASE}/todos`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    return handleResponse<TodoItemResponse>(res);
  },

  /** Update fields of an existing todo */
  async updateTodo(id: number, data: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TodoItemResponse> {
    const res = await fetch(`${BASE}/todos/${id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    return handleResponse<TodoItemResponse>(res);
  },

  /** Delete a todo by id */
  async deleteTodo(id: number): Promise<MessageResponse> {
    const res = await fetch(`${BASE}/todos/${id}`, { method: 'DELETE' });
    return handleResponse<MessageResponse>(res);
  },

  /** Bulk-toggle all todos to the given status */
  async bulkToggle(status: 'pending' | 'completed'): Promise<MessageResponse> {
    const res = await fetch(`${BASE}/todos/bulk-toggle`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ status }),
    });
    return handleResponse<MessageResponse>(res);
  },

  /** Delete all completed todos */
  async bulkDeleteCompleted(): Promise<MessageResponse> {
    const res = await fetch(`${BASE}/todos/bulk-delete`, { method: 'POST' });
    return handleResponse<MessageResponse>(res);
  },
};
