import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signJwt } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const register = asyncHandler(async (req, res) => {
	console.log("i ma register")
	console.log(req.body);
	
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { name, email, password, role, bio, graduationYear, department } = req.body;
	const existing = await User.findOne({ email });
	if (existing) return res.status(409).json({ message: 'Email already in use' });
	const user = await User.create({ name, email, password, role, bio, graduationYear, department });
	const token = signJwt({ sub: user._id, role: user.role });
	const safe = { id: user._id, name: user.name, email: user.email, role: user.role };
	res.status(201).json({ user: safe, token });
});

export const login = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select('+password');
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const match = await bcrypt.compare(password, user.password);
	if (!match) return res.status(401).json({ message: 'Invalid credentials' });
	const token = signJwt({ sub: user._id, role: user.role });
	const safe = { id: user._id, name: user.name, email: user.email, role: user.role };
	res.json({ user: safe, token });
});

export const me = asyncHandler(async (req, res) => {
	res.json({ user: req.user });
});
