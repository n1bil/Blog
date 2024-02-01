import express from 'express';
import { auth } from '../middleware/auth';
import { createComment, getBlogComments, getReplies, deleteComment } from '../controller/commentController';

const router = express.Router();

router.post('/add-comment', auth, createComment);
router.get('/get-post-comments/:blog_id/:skip?', getBlogComments);
router.get('/get-replies/:id', getReplies);
router.delete('/delete-comment/:id', auth, deleteComment);

export default router;