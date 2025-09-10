import { body } from 'express-validator';

export const registerValidator = [
	body('name').trim().notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
	body('role').optional().isIn(['alumni', 'student', 'admin']).withMessage('Invalid role'),
	body('graduationYear').optional().isInt({ min: 1900, max: 3000 }),
];

export const loginValidator = [
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 6 }).withMessage('Password is required'),
];
