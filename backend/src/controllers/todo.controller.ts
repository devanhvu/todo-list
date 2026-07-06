import { Request, Response, NextFunction } from 'express';
import { todoService } from '../services/todo.service.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { TodoFilters, PaginationParams } from '../types/index.js';

export const todoController = {

  // GET /api/stats
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await todoService.getStats();
      res.json(stats);
    } catch (err) { next(err); }
  },

  // GET /api/todos
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, status, category, priority, sortBy, sortOrder, page, limit } = req.query;

      const filters: TodoFilters = {
        q: typeof q === 'string' ? q : undefined,
        status: status === 'pending' || status === 'completed' ? status : 'all',
        category: typeof category === 'string' && category ? category : undefined,
        priority: typeof priority === 'string' && priority ? priority : undefined,
        sortBy: (sortBy === 'createdAt' || sortBy === 'dueDate' || sortBy === 'priority') ? sortBy : 'createdAt',
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      };

      const pagination: PaginationParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await todoService.getAll(filters, pagination);

      res.json({
        success: true,
        data: result.todos,
        pagination: {
          total: result.total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(result.total / (pagination.limit || 10)),
        },
      });
    } catch (err) { next(err); }
  },

  // GET /api/todos/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return next(new AppError('ID không hợp lệ', 400));
      const todo = await todoService.getById(id);
      res.json({ success: true, data: todo });
    } catch (err) { next(err); }
  },

  // POST /api/todos
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const todo = await todoService.create(req.body);
      res.status(201).json({ success: true, data: todo });
    } catch (err) { next(err); }
  },

  // PUT /api/todos/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return next(new AppError('ID không hợp lệ', 400));
      const todo = await todoService.update(id, req.body);
      res.json({ success: true, data: todo });
    } catch (err) { next(err); }
  },

  // DELETE /api/todos/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return next(new AppError('ID không hợp lệ', 400));
      await todoService.delete(id);
      res.json({ success: true, message: 'Đã xóa công việc thành công' });
    } catch (err) { next(err); }
  },

  // POST /api/todos/bulk-toggle
  async bulkToggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (status !== 'pending' && status !== 'completed') {
        return next(new AppError('Trạng thái không hợp lệ', 400));
      }
      const count = await todoService.bulkToggle(status);
      res.json({ success: true, message: `Đã thay đổi trạng thái ${count} công việc` });
    } catch (err) { next(err); }
  },

  // POST /api/todos/bulk-delete
  async bulkDeleteCompleted(_req: Request, res: Response, next: NextFunction) {
    try {
      const count = await todoService.bulkDeleteCompleted();
      res.json({ success: true, message: `Đã xóa ${count} công việc hoàn thành` });
    } catch (err) { next(err); }
  },
};
