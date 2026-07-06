import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todoService } from './todo.service.js';
import { todoRepository } from '../repositories/todo.repository.js';
import { AppError } from '../middlewares/errorHandler.js';

// Mock the todo repository
vi.mock('../repositories/todo.repository.js', () => {
  return {
    todoRepository: {
      findMany: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      bulkToggleStatus: vi.fn(),
      bulkDeleteCompleted: vi.fn(),
      getStats: vi.fn(),
    },
  };
});

describe('TodoService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should return a todo if it exists', async () => {
      const mockTodo = {
        id: 1,
        title: 'Học Vitest',
        description: 'Viết unit test cho service',
        status: 'pending',
        priority: 'medium',
        category: 'work',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(todoRepository.findById).mockResolvedValue(mockTodo);

      const result = await todoService.getById(1);
      expect(result).toEqual(mockTodo);
      expect(todoRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an AppError (404) if the todo does not exist', async () => {
      vi.mocked(todoRepository.findById).mockResolvedValue(null);

      await expect(todoService.getById(999)).rejects.toThrowError(
        new AppError('Không tìm thấy công việc', 404)
      );
      expect(todoRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should trim inputs and call repository.create with correct data', async () => {
      const input = {
        title: '  Làm việc nhà  ',
        description: '  Quét dọn phòng khách   ',
        priority: 'high' as const,
        category: 'personal' as const,
        dueDate: '2026-10-10',
      };

      const mockCreatedTodo = {
        id: 2,
        title: 'Làm việc nhà',
        description: 'Quét dọn phòng khách',
        status: 'pending',
        priority: 'high',
        category: 'personal',
        dueDate: '2026-10-10',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(todoRepository.create).mockResolvedValue(mockCreatedTodo);

      const result = await todoService.create(input);

      expect(result).toEqual(mockCreatedTodo);
      expect(todoRepository.create).toHaveBeenCalledWith({
        title: 'Làm việc nhà',
        description: 'Quét dọn phòng khách',
        status: 'pending',
        priority: 'high',
        category: 'personal',
        dueDate: '2026-10-10',
      });
    });

    it('should apply defaults for status, priority, and category when omitted', async () => {
      const input = {
        title: 'Task mặc định',
      };

      vi.mocked(todoRepository.create).mockResolvedValue({} as any);

      await todoService.create(input);

      expect(todoRepository.create).toHaveBeenCalledWith({
        title: 'Task mặc định',
        description: null,
        status: 'pending',
        priority: 'medium',
        category: 'other',
        dueDate: null,
      });
    });
  });

  describe('update', () => {
    const existingTodo = {
      id: 1,
      title: 'Học Vitest',
      description: 'Viết test',
      status: 'pending',
      priority: 'medium',
      category: 'work',
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should throw 404 if todo does not exist before update', async () => {
      vi.mocked(todoRepository.findById).mockResolvedValue(null);

      await expect(todoService.update(999, { title: 'New title' })).rejects.toThrowError(
        new AppError('Không tìm thấy công việc', 404)
      );
      expect(todoRepository.update).not.toHaveBeenCalled();
    });

    it('should trim string updates and call repository.update', async () => {
      vi.mocked(todoRepository.findById).mockResolvedValue(existingTodo);
      vi.mocked(todoRepository.update).mockResolvedValue({
        ...existingTodo,
        title: 'Học React Query',
      });

      const result = await todoService.update(1, { title: '  Học React Query  ' });

      expect(result.title).toBe('Học React Query');
      expect(todoRepository.update).toHaveBeenCalledWith(1, {
        title: 'Học React Query',
      });
    });
  });

  describe('delete', () => {
    it('should check existence and call repository.delete', async () => {
      const existingTodo = { id: 1 } as any;
      vi.mocked(todoRepository.findById).mockResolvedValue(existingTodo);

      await todoService.delete(1);

      expect(todoRepository.findById).toHaveBeenCalledWith(1);
      expect(todoRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw 404 and not delete if todo does not exist', async () => {
      vi.mocked(todoRepository.findById).mockResolvedValue(null);

      await expect(todoService.delete(999)).rejects.toThrowError(
        new AppError('Không tìm thấy công việc', 404)
      );
      expect(todoRepository.delete).not.toHaveBeenCalled();
    });
  });
});
