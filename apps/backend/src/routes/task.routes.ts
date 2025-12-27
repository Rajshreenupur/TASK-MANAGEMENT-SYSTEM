import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  getTaskActivityLogs,
  deleteTask,
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeProjectAccess } from '../middleware/authorize.middleware.js';
import { validate } from '../utils/validation.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  paginationSchema,
} from '../utils/validation.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorizeProjectAccess,
  validate(createTaskSchema),
  createTask
);

router.get(
  '/project/:projectId',
  authorizeProjectAccess,
  validate(paginationSchema),
  getTasks
);

router.get('/:taskId', getTask);

router.patch('/:taskId', validate(updateTaskSchema), updateTask);

router.patch(
  '/:taskId/status',
  validate(updateTaskStatusSchema),
  updateTaskStatus
);

router.get(
  '/:taskId/activity',
  validate(paginationSchema),
  getTaskActivityLogs
);

router.delete('/:taskId', deleteTask);

export default router;

