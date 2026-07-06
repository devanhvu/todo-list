import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler.js';
import { VALID_PRIORITIES, VALID_CATEGORIES, VALID_STATUSES } from '../models/todo.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ── Joi Validation Schemas ─────────────────────────────────────

const createSchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .max(100)
    .messages({
      'any.required': 'Tiêu đề công việc không được để trống',
      'string.empty': 'Tiêu đề công việc không được để trống',
      'string.max': 'Tiêu đề không được quá 100 ký tự',
    }),
  description: Joi.string()
    .trim()
    .allow(null, '')
    .optional(),
  priority: Joi.string()
    .valid(...VALID_PRIORITIES)
    .optional()
    .messages({
      'any.only': `Độ ưu tiên không hợp lệ. Chọn: ${VALID_PRIORITIES.join(', ')}`,
    }),
  category: Joi.string()
    .valid(...VALID_CATEGORIES)
    .optional()
    .messages({
      'any.only': `Danh mục không hợp lệ. Chọn: ${VALID_CATEGORIES.join(', ')}`,
    }),
  dueDate: Joi.string()
    .pattern(DATE_REGEX)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Định dạng ngày hạn không hợp lệ (YYYY-MM-DD)',
    }),
});

const updateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.empty': 'Tiêu đề không được để trống',
      'string.max': 'Tiêu đề không được quá 100 ký tự',
    }),
  description: Joi.string()
    .trim()
    .allow(null, '')
    .optional(),
  status: Joi.string()
    .valid(...VALID_STATUSES)
    .optional()
    .messages({
      'any.only': 'Trạng thái không hợp lệ (pending hoặc completed)',
    }),
  priority: Joi.string()
    .valid(...VALID_PRIORITIES)
    .optional()
    .messages({
      'any.only': `Độ ưu tiên không hợp lệ. Chọn: ${VALID_PRIORITIES.join(', ')}`,
    }),
  category: Joi.string()
    .valid(...VALID_CATEGORIES)
    .optional()
    .messages({
      'any.only': `Danh mục không hợp lệ. Chọn: ${VALID_CATEGORIES.join(', ')}`,
    }),
  dueDate: Joi.string()
    .pattern(DATE_REGEX)
    .allow(null, '', Object) // Handle empty string/null values for clearing date
    .optional()
    .messages({
      'string.pattern.base': 'Định dạng ngày hạn không hợp lệ (YYYY-MM-DD)',
    }),
}).min(1); // Allow update requests with at least one field

// ── Middleware Functions ───────────────────────────────────────

export function validateCreateTodo(req: Request, _res: Response, next: NextFunction): void {
  const { error, value } = createSchema.validate(req.body, { abortEarly: true, allowUnknown: true });
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  // Mutate request body to use trimmed/coerced values
  req.body = value;
  next();
}

export function validateUpdateTodo(req: Request, _res: Response, next: NextFunction): void {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: true, allowUnknown: true });
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  // Mutate request body to use trimmed/coerced values
  req.body = value;
  next();
}
