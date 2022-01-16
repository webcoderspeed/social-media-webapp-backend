import express from 'express';
const router = express.Router();

import * as userController from '../controllers/userController.js';
import {
  protect
} from '../middlewares/authMiddleware.js';
import {
  uploader
} from '../middlewares/uploadMiddleware.js'

// register a new user route
router
  .route('/')
  .post(userController.registerUser);

router
  .route('/login')
  .post(userController.loginUser);

router
  .route('/profile')
  .get(protect, userController.getMyProfile)
  .put(protect, uploader, userController.updateMyProfile)
  .delete(protect, userController.deleteMyProfile);


// get user followers
router
  .route('/followers/:username')
  .get(protect, userController.getFollowers);

// get user following
router
  .route('/followings/:username')
  .get(protect, userController.getFollowings);


// follow user by username
router
  .route('/follow/:username')
  .put(protect, userController.followUser);

// unfollow user by username
router
  .route('/unfollow/:username')
  .put(protect, userController.unfollowUser);

// search user by username
router
  .route('/:username')
  .get(userController.getUserByUsername)





export default router;
