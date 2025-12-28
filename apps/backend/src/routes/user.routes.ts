import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeOwner } from '../middleware/authorize.middleware.js';
import { demoteToMember, getAllUsers, promoteToOwner } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeOwner);

router.get('/', getAllUsers);

router.patch('/:userId/promote', promoteToOwner);

router.patch('/:userId/demote', demoteToMember);


export default router;

