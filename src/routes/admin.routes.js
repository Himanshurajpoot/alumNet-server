import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers, verifyAlumni, setActive, deleteUser } from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', listUsers);
router.post('/users/:id/verify', verifyAlumni);
router.patch('/users/:id/active', setActive);
router.delete('/users/:id', deleteUser);

export default router;


