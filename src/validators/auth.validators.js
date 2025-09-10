import { body } from 'express-validator';

export const registerValidator = [
	body('name').trim().notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
	body('role').optional().isIn(['alumni', 'student']).withMessage('Invalid role'),
	body('graduationYear').optional().isInt({ min: 1900, max: 3000 }),
    // Alumni conditional fields
    body('batch').if(body('role').equals('alumni')).isInt({ min: 1900, max: 3000 }).withMessage('Batch is required for alumni'),
    body('course').if(body('role').equals('alumni')).trim().notEmpty().withMessage('Course is required for alumni'),
    body('currentJob').if(body('role').equals('alumni')).trim().notEmpty().withMessage('Current job is required for alumni'),
];

export const loginValidator = [
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 6 }).withMessage('Password is required'),
];
