import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  createProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validation.js';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '12345',
          name: 'Test User',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: '',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '',
        },
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createProjectSchema', () => {
    it('should validate correct project data', () => {
      const validData = {
        body: {
          name: 'Test Project',
          description: 'Test Description',
        },
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate project without description', () => {
      const validData = {
        body: {
          name: 'Test Project',
        },
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty project name', () => {
      const invalidData = {
        body: {
          name: '',
          description: 'Test Description',
        },
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createTaskSchema', () => {
    it('should validate correct task data', () => {
      const validData = {
        body: {
          title: 'Test Task',
          description: 'Test Description',
          projectId: '507f1f77bcf86cd799439011',
          assignee: '507f1f77bcf86cd799439012',
          priority: 'HIGH',
        },
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate task with minimal required fields', () => {
      const validData = {
        body: {
          title: 'Test Task',
          projectId: '507f1f77bcf86cd799439011',
        },
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty task title', () => {
      const invalidData = {
        body: {
          title: '',
          projectId: '507f1f77bcf86cd799439011',
        },
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidData = {
        body: {
          title: 'Test Task',
          projectId: '507f1f77bcf86cd799439011',
          priority: 'INVALID',
        },
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid priority values', () => {
      const priorities = ['LOW', 'MEDIUM', 'HIGH'];
      
      priorities.forEach((priority) => {
        const validData = {
          body: {
            title: 'Test Task',
            projectId: '507f1f77bcf86cd799439011',
            priority,
          },
        };

        const result = createTaskSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate task update with all fields', () => {
      const validData = {
        body: {
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'IN_PROGRESS',
          assignee: '507f1f77bcf86cd799439012',
          priority: 'HIGH',
        },
      };

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial task update', () => {
      const validData = {
        body: {
          title: 'Updated Task',
        },
      };

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        body: {
          status: 'INVALID_STATUS',
        },
      };

      const result = updateTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid status values', () => {
      const statuses = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
      
      statuses.forEach((status) => {
        const validData = {
          body: {
            status,
          },
        };

        const result = updateTaskSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateTaskStatusSchema', () => {
    it('should validate status update', () => {
      const validData = {
        body: {
          status: 'IN_PROGRESS',
        },
      };

      const result = updateTaskStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        body: {
          status: 'INVALID',
        },
      };

      const result = updateTaskStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require status field', () => {
      const invalidData = {
        body: {},
      };

      const result = updateTaskStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

