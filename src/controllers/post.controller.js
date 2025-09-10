import Post from '../models/Post.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

export const createPost = asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { title, content } = req.body;
	const post = await Post.create({ author: req.user._id, title, content });
	res.status(201).json(post);
});

export const listPosts = asyncHandler(async (_req, res) => {
	const posts = await Post.find().populate('author', 'name role').sort({ createdAt: -1 });
	res.json(posts);
});

export const getPost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id).populate('author', 'name role');
	if (!post) return res.status(404).json({ message: 'Post not found' });
	res.json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const post = await Post.findById(id);
	if (!post) return res.status(404).json({ message: 'Post not found' });
	if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	const { title, content } = req.body;
	if (title !== undefined) post.title = title;
	if (content !== undefined) post.content = content;
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
	if (!post.likes.includes(userId)) post.likes.push(userId);
	await post.save();
	res.json({ likes: post.likes.length });
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
