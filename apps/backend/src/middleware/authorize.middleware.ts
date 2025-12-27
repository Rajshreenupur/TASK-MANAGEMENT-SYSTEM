import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { Project } from '../models/Project.model.js';

export const authorizeOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'OWNER') {
    res.status(403).json({ error: 'Access denied. Owner role required.' });
    return;
  }
  next();
};

export const authorizeProjectAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user?.userId;

    if (!projectId || !userId) {
      res.status(400).json({ error: 'Project ID and user ID are required' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      return;
    }

    (req as any).project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error checking project access' });
  }
};

export const authorizeProjectOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user?.userId;

    if (!projectId || !userId) {
      res.status(400).json({ error: 'Project ID and user ID are required' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.owner.toString() !== userId) {
      res.status(403).json({ error: 'Access denied. Only project owner can perform this action.' });
      return;
    }

    (req as any).project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error checking project ownership' });
  }
};

