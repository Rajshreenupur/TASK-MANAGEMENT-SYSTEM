import { Response } from 'express';
import { authorizeOwner, authorizeProjectAccess, authorizeProjectOwner } from '../authorize.middleware.js';
import { AuthRequest } from '../auth.middleware.js';
import { Project } from '../../models/Project.model.js';

jest.mock('../../models/Project.model.js', () => ({
  Project: {
    findById: jest.fn(),
  },
}));

describe('Authorization Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: {
        userId: 'user123',
        email: 'test@example.com',
        role: 'MEMBER',
      },
      params: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authorizeOwner', () => {
    it('should allow access for OWNER role', () => {
      mockRequest.user!.role = 'OWNER';

      authorizeOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for MEMBER role', () => {
      mockRequest.user!.role = 'MEMBER';

      authorizeOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied. Owner role required.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user is undefined', () => {
      mockRequest.user = undefined;

      authorizeOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeProjectAccess', () => {
    it('should allow access when user is project owner', async () => {
      const mockProject = {
        _id: 'project123',
        owner: { toString: () => 'user123' },
        members: [],
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      mockRequest.params = { projectId: 'project123' };

      await authorizeProjectAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(Project.findById).toHaveBeenCalledWith('project123');
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access when user is project member', async () => {
      const mockProject = {
        _id: 'project123',
        owner: { toString: () => 'owner123' },
        members: [{ toString: () => 'user123' }],
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      mockRequest.params = { projectId: 'project123' };

      await authorizeProjectAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is neither owner nor member', async () => {
      const mockProject = {
        _id: 'project123',
        owner: { toString: () => 'owner123' },
        members: [{ toString: () => 'member123' }],
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      mockRequest.params = { projectId: 'project123' };

      await authorizeProjectAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied. You are not a member of this project.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when project not found', async () => {
      (Project.findById as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { projectId: 'nonexistent' };

      await authorizeProjectAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Project not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when projectId is missing', async () => {
      mockRequest.params = {};

      await authorizeProjectAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Project ID and user ID are required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get projectId from body if not in params', async () => {
      const mockProject = {
        _id: 'project123',
        owner: { toString: () => 'user123' },
        members: [],
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      mockRequest.body = { projectId: 'project123' };

      await authorizeProjectAccess(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(Project.findById).toHaveBeenCalledWith('project123');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authorizeProjectOwner', () => {
    it('should allow access when user is project owner', async () => {
      const mockProject = {
        _id: 'project123',
        owner: { toString: () => 'user123' },
        members: [],
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      mockRequest.params = { projectId: 'project123' };

      await authorizeProjectOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is not project owner', async () => {
      const mockProject = {
        _id: 'project123',
        owner: { toString: () => 'owner123' },
        members: [{ toString: () => 'user123' }],
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      mockRequest.params = { projectId: 'project123' };

      await authorizeProjectOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access denied. Only project owner can perform this action.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when project not found', async () => {
      (Project.findById as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { projectId: 'nonexistent' };

      await authorizeProjectOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Project not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when projectId is missing', async () => {
      mockRequest.params = {};

      await authorizeProjectOwner(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Project ID and user ID are required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

