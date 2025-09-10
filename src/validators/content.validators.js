import { body } from 'express-validator';

export const createPostValidator = [
	body('title').trim().notEmpty().withMessage('Title is required'),
	body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty when provided'),
];

export const commentValidator = [
	body('text').trim().notEmpty().withMessage('Text is required'),
];

export const createEventValidator = [
	body('title').trim().notEmpty(),
	body('date').isISO8601().withMessage('Valid date is required'),
	body('location').trim().notEmpty(),
];
