import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { createPost, listPosts, getPost, updatePost, deletePost, likePost, commentOnPost } from '../controllers/post.controller.js';
import { createPostValidator, commentValidator } from '../validators/content.validators.js';

const router = Router();

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', requireAuth, upload.single('image'), createPostValidator, createPost);
router.patch('/:id', requireAuth, upload.single('image'), createPostValidator, updatePost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', requireAuth, likePost);
router.post('/:id/comment', requireAuth, commentValidator, commentOnPost);

export default router;
