import { Router } from 'express';
import { register, login, me, updateMe } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

export default router;
