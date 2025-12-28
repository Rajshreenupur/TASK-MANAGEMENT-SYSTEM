import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.model.js';
import { generateToken } from '../utils/jwt.js';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password -refreshTokens').sort({ createdAt: -1 });

    res.json({
      users: users.map((user) => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const promoteToOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const userToPromote = await User.findById(userId);
    if (!userToPromote) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (userToPromote.role === 'OWNER') {
      res.status(400).json({ error: 'User is already an OWNER' });
      return;
    }

    userToPromote.role = 'OWNER';
    await userToPromote.save();

    res.json({
      message: 'User promoted to OWNER successfully',
      user: {
        id: userToPromote._id,
        email: userToPromote.email,
        name: userToPromote.name,
        role: userToPromote.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
};

export const demoteToMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const userToDemote = await User.findById(userId);
    if (!userToDemote) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (userToDemote._id.toString() === currentUserId) {
      res.status(400).json({ error: 'You cannot demote yourself' });
      return;
    }

    if (userToDemote.role === 'MEMBER') {
      res.status(400).json({ error: 'User is already a MEMBER' });
      return;
    }

    const ownerCount = await User.countDocuments({ role: 'OWNER' });
    if (ownerCount <= 1) {
      res.status(400).json({ error: 'Cannot demote the last OWNER. At least one OWNER must exist.' });
      return;
    }

    userToDemote.role = 'MEMBER';
    await userToDemote.save();

    res.json({
      message: 'User demoted to MEMBER successfully',
      user: {
        id: userToDemote._id,
        email: userToDemote.email,
        name: userToDemote.name,
        role: userToDemote.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to demote user' });
  }
};

