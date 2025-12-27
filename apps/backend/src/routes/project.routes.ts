import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  inviteMember,
  removeMember,
} from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  authorizeOwner,
  authorizeProjectAccess,
  authorizeProjectOwner,
} from '../middleware/authorize.middleware.js';
import { validate } from '../utils/validation.js';
import {
  createProjectSchema,
  inviteMemberSchema,
  paginationSchema,
} from '../utils/validation.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeOwner, validate(createProjectSchema), createProject);

router.get('/', validate(paginationSchema), getProjects);

router.get('/:projectId', authorizeProjectAccess, getProject);

router.post('/:projectId/invite',authorizeProjectOwner,validate(inviteMemberSchema),inviteMember);

router.delete('/:projectId/members/:memberId', authorizeProjectOwner, removeMember);

export default router;

