import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPublicAlumni = asyncHandler(async (req, res) => {
	const { q, department, course, job, batch, graduationYear } = req.query;
	const filter = { role: 'alumni', verified: true };

	// Exact-match filters if provided
	if (department) filter.department = department;
	if (course) filter.course = course;
	if (job) filter.currentJob = job;
	if (batch) filter.batch = Number(batch);
	if (graduationYear) filter.graduationYear = Number(graduationYear);

	// Fuzzy search across common text fields
	if (q) {
		filter.$or = [
			{ name: new RegExp(q, 'i') },
			{ department: new RegExp(q, 'i') },
			{ course: new RegExp(q, 'i') },
			{ currentJob: new RegExp(q, 'i') },
		];
	}

	const alumni = await User.find(filter)
		.select('name email role graduationYear department avatarUrl batch course currentJob verified')
		.sort({ name: 1 })
		.lean();
	res.json({ alumni });
});


