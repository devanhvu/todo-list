import prisma from '../config/prisma.js';
import type { TodoFilters, PaginationParams, CreateTodoInput, UpdateTodoInput, TodoStats } from '../types/index.js';
import type { Todo } from '@prisma/client';

export const todoRepository = {
  // Find todos with filtering, sorting, and pagination
  async findMany(filters: TodoFilters, pagination: PaginationParams): Promise<{ todos: Todo[]; total: number }> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, pagination.limit || 10);
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: any = {};
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q } },
        { description: { contains: filters.q } },
      ];
    }
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;

    // Priority sort handled in-memory (Prisma doesn't support CASE ordering natively)
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    const orderBy = sortBy === 'priority' ? { createdAt: sortOrder } : { [sortBy]: sortOrder };

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({ where, orderBy, skip, take: limit }),
      prisma.todo.count({ where }),
    ]);

    // Apply priority sort in-memory after fetching
    if (sortBy === 'priority') {
      const w: Record<string, number> = { high: 3, medium: 2, low: 1 };
      todos.sort((a, b) => {
        const diff = (w[a.priority] || 0) - (w[b.priority] || 0);
        return sortOrder === 'asc' ? diff : -diff;
      });
    }

    return { todos, total };
  },

  /** Find a single todo by primary key */
  async findById(id: number): Promise<Todo | null> {
    return prisma.todo.findUnique({ where: { id } });
  },

  /** Insert a new todo row */
  async create(data: CreateTodoInput & { status: string }): Promise<Todo> {
    return prisma.todo.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.status,
        priority: data.priority ?? 'medium',
        category: data.category ?? 'other',
        dueDate: data.dueDate ?? null,
      },
    });
  },

  /** Update specific fields of an existing todo */
  async update(id: number, data: UpdateTodoInput): Promise<Todo> {
    return prisma.todo.update({ where: { id }, data });
  },

  /** Delete a todo by id; returns false if not found */
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.todo.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  /** Toggle all todos to targetStatus (only those not already in that status) */
  async bulkToggleStatus(targetStatus: 'pending' | 'completed'): Promise<number> {
    const result = await prisma.todo.updateMany({
      where: { status: { not: targetStatus } },
      data: { status: targetStatus },
    });
    return result.count;
  },

  /** Delete all completed todos */
  async bulkDeleteCompleted(): Promise<number> {
    const result = await prisma.todo.deleteMany({ where: { status: 'completed' } });
    return result.count;
  },

  /** Aggregate stats for the dashboard */
  async getStats(): Promise<TodoStats> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const [total, completed, byCategoryRaw, byPriorityRaw, overdue] = await Promise.all([
      prisma.todo.count(),
      prisma.todo.count({ where: { status: 'completed' } }),
      prisma.todo.groupBy({ by: ['category'], _count: { _all: true } }),
      prisma.todo.groupBy({ by: ['priority'], _count: { _all: true } }),
      prisma.todo.count({
        where: { status: 'pending', dueDate: { not: null, lt: today } },
      }),
    ]);

    const byCategory: Record<string, number> = { work: 0, personal: 0, shopping: 0, health: 0, other: 0 };
    byCategoryRaw.forEach((r) => { byCategory[r.category] = r._count._all; });

    const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0 };
    byPriorityRaw.forEach((r) => { byPriority[r.priority] = r._count._all; });

    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate, byCategory, byPriority, overdue };
  },
};
