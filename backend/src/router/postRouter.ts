import express from 'express';
import { create, getTrendingPosts, searchPosts, getFilterLatestPosts, getLatestPosts, searchPostsCount, getPostById, likePost, isLikedByUser, userWrittenPosts, userWrittenPostsCount, deletePost } from '../controller/postController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/create-post', auth, create);
router.get('/latest-posts/:page', getLatestPosts);
router.get('/all-latest-posts-count', getFilterLatestPosts);
router.get('/trending-posts', getTrendingPosts);
router.get('/search-posts', searchPosts);
router.get('/search-posts-count', searchPostsCount);
router.get('/get-post/:post_id', getPostById);
router.post('/like-post', auth, likePost);
router.get('/isLiked-by-user/:post_id', auth, isLikedByUser);
router.get('/user-written-posts', auth, userWrittenPosts);
router.get('/user-written-posts-count', auth, userWrittenPostsCount);
router.delete('/delete-post/:post_id', auth, deletePost);

export default router;