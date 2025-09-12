import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
	const { role, verified, q } = req.query;
	const filter = {};
	if (role) filter.role = role;
	if (typeof verified !== 'undefined') filter.verified = verified === 'true';
	if (q) filter.$or = [
		{ name: new RegExp(q, 'i') },
		{ email: new RegExp(q, 'i') },
	];
	const users = await User.find(filter).select('-password').lean();
	res.json({ users });
});

export const verifyAlumni = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	if (user.role !== 'alumni') return res.status(400).json({ message: 'Only alumni can be verified' });
	user.verified = true;
	await user.save();
	res.json({ message: 'Alumni verified', user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified } });
});

export const setActive = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	const active = Boolean(req.body.isActive);
	user.isActive = active;
	await user.save();
	res.json({ message: 'User state updated', user: { id: user._id, isActive: user.isActive } });
});

export const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	await user.deleteOne();
	res.json({ message: 'User deleted' });
});


