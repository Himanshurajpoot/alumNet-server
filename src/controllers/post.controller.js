import Post from '../models/Post.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

export const createPost = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

	// Only alumni (verified) and admins can create posts
	if (req.user.role === 'student') {
		return res.status(403).json({ message: 'Only alumni and admins can create posts' });
	}
	if (req.user.role === 'alumni' && !req.user.verified) {
		return res.status(403).json({ message: 'Your alumni account must be verified to post' });
	}

	const { title, content } = req.body;
	const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
	const post = await Post.create({ author: req.user._id, title, content, imageUrl });
	res.status(201).json(post);
});

export const listPosts = asyncHandler(async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	const search = req.query.search;

	let query = {};
	if (search) {
		query = {
			$or: [
				{ title: new RegExp(search, 'i') },
				{ content: new RegExp(search, 'i') }
			]
		};
	}

	const posts = await Post.find(query)
		.populate('author', 'name role')
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	const total = await Post.countDocuments(query);
	const withCounts = posts.map((p) => {
		const obj = p.toObject();
		obj.likesCount = p.likes?.length || 0;
		obj.commentsCount = p.comments?.length || 0;
		return obj;
	});

	res.json({
		posts: withCounts,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit),
			totalPosts: total,
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1
		},
		search: search || null
	});
});

export const getPost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id).populate('author', 'name role');
	if (!post) return res.status(404).json({ message: 'Post not found' });
	const obj = post.toObject();
	obj.likesCount = post.likes?.length || 0;
	obj.commentsCount = post.comments?.length || 0;
	res.json(obj);
});

export const updatePost = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

	const { id } = req.params;
	const post = await Post.findById(id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	const { title, content } = req.body;
	if (title !== undefined) post.title = title;
	if (content !== undefined) post.content = content;
	if (req.file) post.imageUrl = `/uploads/${req.file.filename}`;
	await post.save();
	res.json(post);
});

export const deletePost = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const post = await Post.findById(id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	await post.deleteOne();
	res.status(204).send();
});

export const likePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	const userId = req.user._id;
	const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());
	if (alreadyLiked) {
		await Post.updateOne({ _id: post._id }, { $pull: { likes: userId } });
	} else {
		await Post.updateOne({ _id: post._id }, { $addToSet: { likes: userId } });
	}
	const updated = await Post.findById(post._id).select('likes');
	res.json({ liked: !alreadyLiked, likes: updated.likes.length });
});

export const commentOnPost = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const post = await Post.findById(req.params.id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	post.comments.push({ user: req.user._id, text: req.body.text });
	await post.save();
	res.status(201).json(post.comments[post.comments.length - 1]);
});
