import { Router } from 'express';
import { todoController } from '../controllers/todo.controller.js';
import { validateCreateTodo, validateUpdateTodo } from '../middlewares/validateTodo.js';

const router = Router();

// Stats
router.get('/stats', todoController.getStats);

// Bulk actions (must come BEFORE /:id routes)
router.post('/todos/bulk-toggle', todoController.bulkToggle);
router.post('/todos/bulk-delete', todoController.bulkDeleteCompleted);

// CRUD
router.get('/todos', todoController.getAll);
router.get('/todos/:id', todoController.getById);
router.post('/todos', validateCreateTodo, todoController.create);
router.put('/todos/:id', validateUpdateTodo, todoController.update);
router.delete('/todos/:id', todoController.delete);

export default router;
