import { Router } from 'express';
import { getPublicAlumni } from '../controllers/user.controller.js';

const router = Router();

router.get('/alumni', getPublicAlumni);

export default router;


