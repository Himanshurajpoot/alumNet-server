import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createPost, listPosts, getPost, updatePost, deletePost, likePost, commentOnPost } from '../controllers/post.controller.js';
import { createPostValidator, commentValidator } from '../validators/content.validators.js';

const router = Router();

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', requireAuth, createPostValidator, createPost);
router.patch('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', requireAuth, likePost);
router.post('/:id/comment', requireAuth, commentValidator, commentOnPost);

export default router;
