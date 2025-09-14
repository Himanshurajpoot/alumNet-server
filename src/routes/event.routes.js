import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createEvent, listEvents, getEvent, updateEvent, deleteEvent, attendEvent, leaveEvent } from '../controllers/event.controller.js';
import { createEventValidator } from '../validators/content.validators.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', requireAuth, createEventValidator, createEvent);
router.patch('/:id', requireAuth, createEventValidator, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);
router.post('/:id/attend', requireAuth, attendEvent);
router.post('/:id/leave', requireAuth, leaveEvent);

export default router;
