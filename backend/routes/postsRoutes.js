import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController.js';
import {
  protect
} from '../middlewares/authMiddleware.js';
import {
  uploaderMultiple
} from '../middlewares/uploadMiddleware.js';

// get all posts
router
  .route('/')
  .get(postController.getPosts)
  .post(protect, uploaderMultiple, postController.createPost);


// get a single post
router
  .route('/:id')
  .get(postController.getPost)
  .put(protect, uploaderMultiple, postController.updatePost)
  .delete(protect, postController.deletePost);

export default router;