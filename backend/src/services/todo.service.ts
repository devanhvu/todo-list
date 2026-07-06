import { todoRepository } from '../repositories/todo.repository.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { TodoFilters, PaginationParams, CreateTodoInput, UpdateTodoInput, TodoStats } from '../types/index.js';
import type { Todo } from '@prisma/client';

export const todoService = {

  async getAll(filters: TodoFilters, pagination: PaginationParams) {
    return todoRepository.findMany(filters, pagination);
  },

  async getById(id: number): Promise<Todo> {
    const todo = await todoRepository.findById(id);
    if (!todo) throw new AppError('Không tìm thấy công việc', 404);
    return todo;
  },

  async create(input: CreateTodoInput): Promise<Todo> {
    return todoRepository.create({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: 'pending',
      priority: input.priority || 'medium',
      category: input.category || 'other',
      dueDate: input.dueDate || null,
    });
  },

  async update(id: number, input: UpdateTodoInput): Promise<Todo> {
    // Ensure the todo exists before updating
    await this.getById(id);

    const data: UpdateTodoInput = {};
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.category !== undefined) data.category = input.category;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate || null;

    return todoRepository.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await this.getById(id);
    await todoRepository.delete(id);
  },

  async bulkToggle(status: 'pending' | 'completed'): Promise<number> {
    return todoRepository.bulkToggleStatus(status);
  },

  async bulkDeleteCompleted(): Promise<number> {
    return todoRepository.bulkDeleteCompleted();
  },

  async getStats(): Promise<TodoStats> {
    return todoRepository.getStats();
  },
};
