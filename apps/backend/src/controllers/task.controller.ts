import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Task, TaskStatus } from '../models/Task.model.js';
import { ActivityLog } from '../models/ActivityLog.model.js';
import { isValidTransition } from '../utils/taskStateTransition.js';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, projectId, assignee, priority } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const task = await Task.create({
    title,
    description,
    projectId,
    assignee: assignee || undefined,
    priority: priority || 'MEDIUM',
    status: 'BACKLOG',
    createdBy: userId,
  });

  await ActivityLog.create({
    taskId: task._id,
    action: 'TASK_CREATED',
    performedBy: userId,
    newValue: 'BACKLOG',
    metadata: {
      title: task.title,
    },
  });

  await task.populate('assignee', 'name email');
  await task.populate('createdBy', 'name email');
  await task.populate('projectId', 'name');

  res.status(201).json({
    message: 'Task created successfully',
    task,
  });
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as TaskStatus | undefined;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const query: any = { projectId };
  if (status) {
    query.status = status;
  }

  const tasks = await Task.find(query)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Task.countDocuments(query);

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('projectId', 'name description owner members');

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json({ task });
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const userId = req.user?.userId;
  const updates = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (updates.status && updates.status !== task.status) {
    if (!isValidTransition(task.status, updates.status)) {
      res.status(400).json({
        error: `Invalid status transition from ${task.status} to ${updates.status}`,
      });
      return;
    }

    await ActivityLog.create({
      taskId: task._id,
      action: 'TASK_STATUS_CHANGED',
      performedBy: userId,
      previousValue: task.status,
      newValue: updates.status,
    });
  }

  if (updates.assignee && updates.assignee !== task.assignee?.toString()) {
    await ActivityLog.create({
      taskId: task._id,
      action: 'TASK_ASSIGNED',
      performedBy: userId,
      previousValue: task.assignee?.toString() || 'Unassigned',
      newValue: updates.assignee,
    });
  }

  Object.assign(task, updates);
  await task.save();

  await task.populate('assignee', 'name email');
  await task.populate('createdBy', 'name email');
  await task.populate('projectId', 'name');

  res.json({
    message: 'Task updated successfully',
    task,
  });
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (task.status === status) {
    res.status(400).json({ error: 'Task is already in this status' });
    return;
  }

  if (!isValidTransition(task.status, status)) {
    res.status(400).json({
      error: `Invalid status transition from ${task.status} to ${status}`,
    });
    return;
  }

  const previousStatus = task.status;
  task.status = status;
  await task.save();

  await ActivityLog.create({
    taskId: task._id,
    action: 'TASK_STATUS_CHANGED',
    performedBy: userId,
    previousValue: previousStatus,
    newValue: status,
  });

  await task.populate('assignee', 'name email');
  await task.populate('createdBy', 'name email');

  res.json({
    message: 'Task status updated successfully',
    task,
  });
};

export const getTaskActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const logs = await ActivityLog.find({ taskId })
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await ActivityLog.countDocuments({ taskId });

  res.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  await ActivityLog.deleteMany({ taskId });

  await Task.findByIdAndDelete(taskId);

  res.json({ message: 'Task deleted successfully' });
};

