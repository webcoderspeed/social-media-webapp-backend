import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploaderMultiple } from '../middlewares/uploadMiddleware.js';

// get all posts
router
  .route('/')
  .get(postController.getPosts)
  .post(protect, uploaderMultiple, postController.createPost);

// comment on a post
router.route('/:id/comment').post(protect, postController.commentOnPost);

// mutation in comments
router
  .route('/:id/comment/:commentId')
  .put(protect, postController.updateComment)
  .delete(protect, postController.deleteComment);

router
  .route('/:id/comment/:commentId/reply')
  .post(protect, postController.replyToComment);

// mutation in replies
router
  .route('/:id/comment/:commentId/reply/:replyId')
  .put(protect, postController.updateReply)
  .delete(protect, postController.deleteReply);

// like a post
router.route('/:id/like').put(protect, postController.likePost);

// unlike a post
router.route('/:id/unlike').put(protect, postController.unlikePost);

// share a post
router.route('/:id/share').put(protect, postController.sharePost);

router.route('/user/:id').get(postController.getPostsByUserId);

// get a single post
router
  .route('/:id')
  .get(postController.getPost)
  .put(protect, uploaderMultiple, postController.updatePost)
  .delete(protect, postController.deletePost);

export default router;
