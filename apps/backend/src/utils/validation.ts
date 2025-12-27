import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const validate = (schema: z.ZodSchema) => {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }
      next(error);
    }
  };
};

