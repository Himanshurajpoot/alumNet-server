import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signJwt } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const register = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { name, email, password } = req.body;
	const requestedRole = (req.body.role || 'student').toLowerCase();
	const graduationYear = req.body.graduationYear;
	const department = req.body.department;
	const batch = req.body.batch;
	const course = req.body.course;
	const currentJob = req.body.currentJob;

	const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
	if (!email.endsWith(`@${domain}`)) {
		return res.status(400).json({ message: `Registration requires a college email (@${domain})` });
	}

	if (requestedRole === 'admin') {
		return res.status(400).json({ message: 'Admin accounts cannot be self-registered' });
	}

	const existing = await User.findOne({ email });
	if (existing) return res.status(409).json({ message: 'Email already in use' });

	let finalRole = 'student';
	const createDoc = { name, email, password };

	if (requestedRole === 'alumni') {
		// Alumni must provide additional fields (job optional)
		if (!batch || !course) {
			return res.status(400).json({ message: 'Alumni must provide batch and course' });
		}
		finalRole = 'alumni';
		createDoc.role = finalRole;
		createDoc.batch = batch;
		createDoc.course = course;
		if (currentJob) createDoc.currentJob = currentJob;
		if (graduationYear) createDoc.graduationYear = graduationYear;
		if (department) createDoc.department = department;
		createDoc.verified = true; // requires admin verification
	} else {
		// Student registration: ignore alumni-only fields
		finalRole = 'student';
		createDoc.role = finalRole;
		if (graduationYear) createDoc.graduationYear = graduationYear;
		if (department) createDoc.department = department;
	}

	const user = await User.create(createDoc);
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
	if (user.isActive === false) return res.status(403).json({ message: 'Account is inactive. Contact admin.' });
	const match = await bcrypt.compare(password, user.password);
	if (!match) return res.status(401).json({ message: 'Invalid credentials' });
	const token = signJwt({ sub: user._id, role: user.role });
	const safe = { id: user._id, name: user.name, email: user.email, role: user.role , avatarUrl: user.avatarUrl};
	res.json({ user: safe, token });
});

export const me = asyncHandler(async (req, res) => {
	res.json({ user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (!user) return res.status(404).json({ message: 'User not found' });

	// Students: cannot edit alumni-only fields
	// Alumni: can edit their own profile fields (not role, email, verified)
	const forbiddenForAll = ['role', 'email', 'password', 'verified', 'isActive'];
	for (const key of forbiddenForAll) delete req.body[key];

	if (req.user.role === 'student') {
		delete req.body.currentJob;
		delete req.body.course;
		delete req.body.batch;
	}

	Object.assign(user, req.body);
	await user.save();
	const safe = { id: user._id, name: user.name, email: user.email, role: user.role };
	res.json({ user: safe });
});

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	
	if (!user) {
		// Don't reveal if email exists or not for security
		return res.json({ message: 'If the email exists, a password reset link has been sent.' });
	}

	const resetToken = user.generatePasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// In a real application, you would send an email here
	// For now, we'll just return the token (remove this in production)
	res.json({ 
		message: 'Password reset token generated',
		resetToken: resetToken // Remove this in production
	});
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { token, password } = req.body;
	
	if (!token || !password) {
		return res.status(400).json({ message: 'Token and password are required' });
	}

	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
	const user = await User.findOne({
		resetPasswordToken: hashedToken,
		resetPasswordExpires: { $gt: Date.now() }
	});

	if (!user) {
		return res.status(400).json({ message: 'Token is invalid or has expired' });
	}

	user.password = password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	await user.save();

	res.json({ message: 'Password has been reset successfully' });
});
