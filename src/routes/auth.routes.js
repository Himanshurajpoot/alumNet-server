import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, me);
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

export default router;
