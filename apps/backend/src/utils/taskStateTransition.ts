import { TaskStatus } from '../models/Task.model.js';

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  BACKLOG: ['IN_PROGRESS'],
  IN_PROGRESS: ['REVIEW'],
  REVIEW: ['DONE'],
  DONE: [],
};

export const isValidTransition = (
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean => {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

export const getValidTransitions = (currentStatus: TaskStatus): TaskStatus[] => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};

