import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import path from 'path';

export const getMyProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select('-password');
	if (!user) return res.status(404).json({ message: 'User not found' });
	res.json({ user });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (!user) return res.status(404).json({ message: 'User not found' });

	// Alumni can only edit after verification
	if (user.role === 'alumni' && !user.verified) {
		return res.status(403).json({ message: 'Alumni profile can be edited only after verification' });
	}

	const forbiddenForAll = ['role', 'email', 'password', 'verified', 'isActive'];
	for (const key of forbiddenForAll) delete req.body[key];

	if (user.role === 'student') {
		delete req.body.currentJob;
		delete req.body.course;
		delete req.body.batch;
	}

	Object.assign(user, req.body);
	await user.save();
	const safe = { id: user._id, name: user.name, email: user.email, role: user.role };
	res.json({ user: safe });
});

export const getPublicProfileById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password');
	if (!user) return res.status(404).json({ message: 'User not found' });
	// Only expose public fields; for alumni, prefer verified
	const publicFields = {
		id: user._id,
		name: user.name,
		email: user.email,
		role: user.role,
		graduationYear: user.graduationYear,
		department: user.department,
		avatarUrl: user.avatarUrl,
		batch: user.batch,
		course: user.course,
		currentJob: user.currentJob,
		verified: user.verified,
	};
	res.json({ user: publicFields });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
	if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
	const user = await User.findById(req.user._id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	if (user.role === 'alumni' && !user.verified) {
		return res.status(403).json({ message: 'Alumni profile can be edited only after verification' });
	}
	const fileUrl = `/uploads/${req.file.filename}`;
	user.avatarUrl = fileUrl;
	await user.save();
	res.json({ avatarUrl: fileUrl });
});


