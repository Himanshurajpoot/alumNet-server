import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPublicAlumni = asyncHandler(async (req, res) => {
	const { q } = req.query;
	const filter = { role: 'alumni', verified: true };
	if (q) {
		filter.$or = [
			{ name: new RegExp(q, 'i') },
			{ department: new RegExp(q, 'i') },
			{ course: new RegExp(q, 'i') },
			{ currentJob: new RegExp(q, 'i') },
		];
	}
	const alumni = await User.find(filter)
		.select('name email role bio graduationYear department avatarUrl batch course currentJob verified')
		.sort({ name: 1 });
	res.json({ alumni });
});


