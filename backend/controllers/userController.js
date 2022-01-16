import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/emailSender.js';
import crypto from 'crypto';
import * as cloudinary from '../utils/cloudinary.js';
import mongoose from 'mongoose';

/**
 * @desc   Register a new user and generate token
 * @route  POST /api/v1/users/register
 * @access Public
 * @param  {string} req.body.username
 * @param  {string} req.body.email
 * @param  {string} req.body.password
 * @return {object} Json response
 */

export const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password, username } = req.body;

  // check user exist with same username
  const usernameExists = await User.findOne({
    username,
  });

  if (usernameExists) {
    return res.status(400).json({
      success: false,
      error: `User with username ${username} already exists`,
    });
  }

  // check user exist with same email
  const emailExists = await User.findOne({
    email,
  });

  if (emailExists) {
    return res.status(400).json({
      success: false,
      error: `User with email ${email} already exists`,
    });
  }

  //  check password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long',
    });
  }

  // create user
  const user = await User.create({
    email,
    password,
    username,
  });

  // generate token
  const token = generateToken(user._id);

  if (user) {
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          bio: user.bio,
          website: user.website,
          token: token,
        },
      },
    });
  }
});

/**
 * @desc   Login a user and generate token
 * @route  POST /api/v1/users/login
 * @access Public
 * @param  {string} req.body.email
 * @param  {string} req.body.username
 * @param  {string} req.body.password
 * @return {object} Json response
 */

export const loginUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // check if user email exist
  const keyword = {
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  };

  const user = await User.findOne(keyword);

  if (!user) {
    return res.status(400).json({
      success: false,
      error: `User with \`${email ? 'email' : 'username'}\`${email ?? username ?? ''
        } does not exist`,
    });
  }

  // check if password is correct
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'Incorrect password',
    });
  }

  // generate token
  const token = generateToken(user._id);

  if (user) {
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          backgroundImage: user.backgroundImage,
          bio: user.bio,
          website: user.website,
          token: token,
        },
      },
    });
  }
});

/**
 * @desc  Get my profile
 * @route GET /api/v1/users/profile
 * @access Private
 * @return {object} Json response
 */

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        backgroundImage: user.backgroundImage,
        bio: user.bio,
        website: user.website,
        followings: user.followings,
        followers: user.followers,
      },
    },
  });
});

/**
 * @desc  Update my profile
 * @route PUT /api/v1/users/profile
 * @access Private
 * @return {object} Json response
 */

export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  let {
    username,
    email,
    password,
    bio,
    website,
    profilePic,
    phone,
    backgroundImage,
  } = req.body;

  if (user) {
    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.password = password ?? user.password;
    user.bio = bio ?? user.bio;
    user.website = website ?? user.website;
    user.phone = phone ?? user.phone;

    if (profilePic) {
      const { file } = req;
      const result = await cloudinary.imageUploader(file, profilePic);
      user.profilePic[0] = result
        ? {
          asset_id: result.public_id,
          public_id: result.public_id,
          url: result.url,
          secure_url: result.secure_url,
        }
        : user.profilePic[0];
    }

    if (backgroundImage) {
      const { file } = req;
      const result = await cloudinary.imageUploader(file, backgroundImage);
      user.backgroundImage[0] = result
        ? {
          asset_id: result.public_id,
          public_id: result.public_id,
          url: result.url,
          secure_url: result.secure_url,
        }
        : user.backgroundImage[0];
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          backgroundImage: user.backgroundImage,
          bio: user.bio,
          website: user.website,
          location: user.location,
          followings: user.followings,
          followers: user.followers,
        },
      },
    });
  }
});

/**
 * @desc  delete my profile
 * @route DELETE /api/v1/users/profile
 * @access Private
 */

export const deleteMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  await user.remove();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc   Get user by username
 * @route  GET /api/v1/users/:username
 * @access Public
 */

export const getUserByUsername = asyncHandler(async (req, res, next) => {
  // matches the username
  const users = await User.find({
    username: {
      $regex: new RegExp(req.params.username),
      $options: 'gi',
    },
  }).select('-password -__v -createdAt -updatedAt -isAdmin');

  if (!users) {
    return res.status(404).json({
      success: false,
      error: 'No username found',
    });
  }

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: {
      users,
    },
  });
});

/**
 * @desc  Follow a user
 * @route PUT /api/v1/users/follow/:username
 * @access Private
 */

export const followUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // checking wheather both the users are same or not
  if (user.username === req.params.username) {
    return res.status(400).json({
      success: false,
      error: 'You cannot follow yourself',
    });
  }

  const userToFollow = await User.findOne({
    username: req.params.username,
  });

  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      error: 'User to follow not found',
    });
  }

  // checking wheather the user is already followed or not
  const isFollowing = user.followings.some(
    (following) =>
      following?.userId?.toString() === userToFollow?._id?.toString()
  );

  if (isFollowing) {
    return res.status(400).json({
      success: false,
      error: 'You are already following this user',
    });
  }

  // adding the user to the followings array
  user.followings.push({
    userId: userToFollow._id,
  });
  await user.save();

  // adding the user to the followers array
  userToFollow.followers.push({
    userId: user._id,
  });
  await userToFollow.save();

  res.status(200).json({
    status: 'success',
    data: {
      followings: user.followings,
    },
  });
});

/**
 * @desc Unfollow a user
 * @route PUT /api/v1/users/unfollow/:username
 * @access Private
 */

export const unfollowUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const userToFollow = await User.findOne({
    username: req.params.username,
  });

  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      error: 'User to follow not found',
    });
  }

  // checking wheather the user is already followed or not
  const isFollowing = user.followings.some(
    (following) =>
      following?.userId?.toString() === userToFollow?._id?.toString()
  );

  if (!isFollowing) {
    return res.status(400).json({
      success: false,
      error: 'You are not following this user',
    });
  }

  if (isFollowing) {
    // removing the user from the followings array
    user.followings = user.followings.filter(
      (following) =>
        following?.userId?.toString() !== userToFollow?._id?.toString()
    );

    await user.save();

    // removing the user from the followers array
    userToFollow.followers = userToFollow.followers.filter(
      (follower) => follower?.userId?.toString() !== user._id?.toString()
    );
    await userToFollow.save();

    res.status(200).json({
      status: 'success',
      data: {
        followings: user.followings,
      },
    });
  }
});


/**
 * @desc  Get user followers list
 * @route GET /api/v1/users/followers/:username
 * @access Public
 */

export const getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    username: req.params.username,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const followers = await User.find({
    _id: {
      $in: user.followers.map((follower) => follower.userId),
    },
  }).select('-password -__v -createdAt -updatedAt -isAdmin').populate({
    path: 'followers',
    model: 'User',
  });

  res.status(200).json({
    status: 'success',
    data: {
      followers,
    },
  });
});

/**
 * @desc  Get user followings list
 * @route GET /api/v1/users/followings/:username
 * @access Public
 */

export const getFollowings = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    username: req.params.username,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const followings = await User.find({
    _id: {
      $in: user.followings.map((following) => following.userId),
    },
  }).select('-password -__v -createdAt -updatedAt -isAdmin').populate({
    path: 'followings',
    model: 'User',
  });

  res.status(200).json({
    status: 'success',
    data: {
      followings,
    },
  });
});

/**
 * @desc forgot password
 * @route POST /api/v1/users/forgotpassword
 * @access Public
 */

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  // sended it back to user's email
  const resetURL = `${process.env.CLIENT_URL}/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a update request with your new password and password Confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      message: `Token send to the email`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(500);
    throw new Error('There was an error sending the email. Try again later!');
  }
});

/**
 * @desc reset password
 * @route POST /api/v1/users/resetpassword
 * @access Public
 * @param {string} token
 */

export const resetPassword = asyncHandler(async (req, res, next) => {

  // get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // if token is not expired, and there is a user, set the new password
  if (!user) {
    res.status(400);
    throw new Error('Token is invalid or has expired');
  }

  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password === confirmPassword) {
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  } else {
    res.status(400);
    throw new Error("Password didn't match");
  }

  // Update the user in, send JWT
  const token = generateToken(user?._id);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        website: user.website,
        token: token,
      },
    },
  });
});

