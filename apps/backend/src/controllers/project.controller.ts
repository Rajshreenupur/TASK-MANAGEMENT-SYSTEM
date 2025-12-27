import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Project } from '../models/Project.model.js';
import { User } from '../models/User.model.js';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const project = await Project.create({
    name,
    description,
    owner: userId,
    members: [],
  });

  await project.populate('owner', 'name email');

  res.status(201).json({
    message: 'Project created successfully',
    project,
  });
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Project.countDocuments({
    $or: [{ owner: userId }, { members: userId }],
  });

  res.json({
    projects,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const project = (req as any).project;

  await project.populate('owner', 'name email');
  await project.populate('members', 'name email');

  res.json({ project });
};

export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  const { projectId } = req.params;
  const project = (req as any).project;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (project.members.some((memberId: any) => memberId.toString() === user._id.toString())) {
    res.status(400).json({ error: 'User is already a member of this project' });
    return;
  }

  if (project.owner.toString() === user._id.toString()) {
    res.status(400).json({ error: 'User is already the owner of this project' });
    return;
  }

  project.members.push(user._id);
  await project.save();

  await project.populate('members', 'name email');

  res.json({
    message: 'Member invited successfully',
    project,
  });
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId, memberId } = req.params;
  const project = (req as any).project;

  project.members = project.members.filter(
    (memberIdObj: any) => memberIdObj.toString() !== memberId
  );
  await project.save();

  await project.populate('members', 'name email');

  res.json({
    message: 'Member removed successfully',
    project,
  });
};

