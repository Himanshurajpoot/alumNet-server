import Event from '../models/Event.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

export const createEvent = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { title, description, date, location } = req.body;
	const event = await Event.create({ title, description, date, location, organizer: req.user._id });
	res.status(201).json(event);
});

export const listEvents = asyncHandler(async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;

	const events = await Event.find()
		.populate('organizer', 'name')
		.sort({ date: 1 })
		.skip(skip)
		.limit(limit);

	const total = await Event.countDocuments();

	res.json({
		events,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit),
			totalEvents: total,
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1
		}
	});
});

export const getEvent = asyncHandler(async (req, res) => {
	const event = await Event.findById(req.params.id).populate('organizer', 'name');
	if (!event) return res.status(404).json({ message: 'Event not found' });
	res.json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	const { title, description, date, location } = req.body;
	if (title !== undefined) event.title = title;
	if (description !== undefined) event.description = description;
	if (date !== undefined) event.date = date;
	if (location !== undefined) event.location = location;
	await event.save();
	res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	await event.deleteOne();
	res.status(204).send();
});

export const attendEvent = asyncHandler(async (req, res) => {
	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	const userId = req.user._id;
	if (!event.attendees.includes(userId)) event.attendees.push(userId);
	await event.save();
	res.json({ attendees: event.attendees.length });
});

export const leaveEvent = asyncHandler(async (req, res) => {
	const event = await Event.findById(req.params.id);
	if (!event) return res.status(404).json({ message: 'Event not found' });
	event.attendees = event.attendees.filter((id) => id.toString() !== req.user._id.toString());
	await event.save();
	res.json({ attendees: event.attendees.length });
});
