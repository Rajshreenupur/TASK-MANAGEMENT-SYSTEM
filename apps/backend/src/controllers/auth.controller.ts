import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.model.js';
import { generateToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.js';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ error: 'User with this email already exists' });
    return;
  }

  const user = await User.create({
    email,
    password,
    name,
    role: 'MEMBER',
  });

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry();
  user.addRefreshToken(refreshToken, refreshTokenExpiry);
  await user.save();

  res.status(201).json({
    message: 'User registered successfully',
    token,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry();
  user.addRefreshToken(refreshToken, refreshTokenExpiry);
  await user.save();

  res.json({
    message: 'Login successful',
    token,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId).select('-password');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  const user = await User.findOne({
    'refreshTokens.token': refreshToken,
  }).select('+refreshTokens');

  if (!user || !user.hasValidRefreshToken(refreshToken)) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
    return;
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  user.removeRefreshToken(refreshToken);
  const newRefreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry();
  user.addRefreshToken(newRefreshToken, refreshTokenExpiry);
  await user.save();

  res.json({
    message: 'Token refreshed successfully',
    token,
    refreshToken: newRefreshToken,
  });
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
    });

    if (user) {
      user.removeRefreshToken(refreshToken);
      await user.save();
    }
  }

  res.json({ message: 'Logged out successfully' });
};

