import Post from '../models/postModel.js';
import asyncHandler from 'express-async-handler';
import * as cloudinary from '../utils/cloudinary.js';

/**
 * @desc - get all the posts
 * @route - GET /api/v1/posts
 * @access - public
 */

export const getPosts = asyncHandler(async (req, res, next) => {

  const keyword = req.query.caption ? {
    caption: {
      $regex: req.query.caption,
      $options: 'gi'
    }
  } : {}

  const posts = await Post.find(keyword).populate({
    path: 'userId',
    model: 'User',
  });
  res.status(200).json({
    success: true,
    count: posts.length,
    data: {
      posts,
    },
  });
})


/**
 * @desc - get a single post
 * @route - GET /api/v1/posts/:id
 * @access - public
 * @param - id
 */

export const getPost = asyncHandler(async (req, res, next) => {

  const post = await Post.findById(req.params.id).populate({
    path: 'userId',
    model: 'User',
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      post,
    },
  });
});

/**
 * @desc - create a new post
 * @route - POST /api/v1/posts
 * @access - private
 */

export const createPost = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const {
    caption,
    type,
  } = req.body;

  const hashtags = caption?.match(/#\w+/g) ?? [];
  const files = req.files;

  const uploadedData = [];

  if (files && type === 'image') {
    const promises = files.map(async (image) => {
      const result = await cloudinary.imageUploader(image);
      uploadedData.push(result);
      return result;
    })

    await Promise.all(promises).then(result => {
      const images = result.map(image => {
        return {
          asset_id: image.public_id,
          public_id: image.public_id,
          url: image.url,
          secure_url: image.secure_url,
        }
      });

      // create a new post
      const post = new Post({
        caption,
        type,
        images,
        hashtags,
        userId: user._id,
      });

      post.save();

      // return the post
      res.status(201).json({
        success: true,
        data: {
          post,
        },
      });
    }).catch
      (err => console.log(err));
  } else if (files && type === 'video') {
    const promises = files.map(async (video) => {
      const result = await cloudinary.videoUploader(video, "videos", type);
      uploadedData.push(result);
      return result;
    })

    await Promise.all(promises).then(result => {
      const videos = result.map(video => {
        return {
          asset_id: video.public_id,
          public_id: video.public_id,
          url: video.url,
          secure_url: video.secure_url,
        }
      });

      // create a new post
      const post = new Post({
        caption,
        type,
        videos,
        hashtags,
        userId: user._id,
      });

      post.save();

      // return the post
      res.status(201).json({
        success: true,
        data: {
          post,
        },
      });
    }).catch
      (err => console.log(err));
  } else {
    // create a new post
    const post = new Post({
      caption,
      type,
      hashtags,
      userId: user._id,
    });

    post.save();

    // return the post
    res.status(201).json({
      success: true,
      data: {
        post,
      },
    });
  }
});

/**
 * @desc - update a post
 * @route - PUT /api/v1/posts/:id
 * @access - private
 */

export const updatePost = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  if (post.userId.toString() !== user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  const {
    caption,
    type,
  } = req.body;

  const hashtags = caption?.match(/#\w+/g) ?? [];

  const files = req.files;

  const uploadedData = [];

  if (type === 'image') {
    
    if(!files) {
      // create a new post
      post.caption = caption ?? post.caption;
      post.type = type ?? post.type;
      post.images = images ?? post.images;
      post.hashtags = hashtags ?? post.hashtags;
      post.save();

      // return the post
      res.status(200).json({
        success: true,
        data: {
          post,
        },
      });
    }
    
    const promises = files.map(async (image) => {
      const result = await cloudinary.imageUploader(image, "images");
      uploadedData.push(result);
      return result;
    })

    await Promise.all(promises).then(result => {
      const images = result.map(image => {
        return {
          asset_id: image.public_id,
          public_id: image.public_id,
          url: image.url,
          secure_url: image.secure_url,
        }
      });

      // create a new post
      post.caption = caption ?? post.caption;
      post.type = type ?? post.type;
      post.images = images ?? post.images;
      post.hashtags = hashtags ?? post.hashtags;
      post.save();

      // return the post
      res.status(200).json({
        success: true,
        data: {
          post,
        },
      });
    }).catch
      (err => console.log(err));
  } else if (type === 'video') {

    if(!files) {
      // create a new post
      post.caption = caption ?? post.caption;
      post.type = type ?? post.type;
      post.images = images ?? post.images;
      post.hashtags = hashtags ?? post.hashtags;
      post.save();

      // return the post
      res.status(200).json({
        success: true,
        data: {
          post,
        },
      });
    }

    const promises = files.map(async (video) => {
      const result = await cloudinary.videoUploader(video, "videos", type);
      uploadedData.push(result);
      return result;
    })

    await Promise.all(promises).then(result => {
      const videos = result.map(video => {
        return {
          asset_id: video.public_id,
          public_id: video.public_id,
          url: video.url,
          secure_url: video.secure_url,
        }
      }
      );

      // create a new post
      post.caption = caption ?? post.caption;
      post.type = type ?? post.type;
      post.videos = [...post.videos, ...videos];
      post.hashtags = hashtags ?? post.hashtags;
      post.save();

      // return the post
      res.status(200).json({
        success: true,
        data: {
          post,
        },
      });
    }
    ).catch(err => console.log(err));
  } else {
    // update a new post
    post.caption = caption ?? post.caption;
    post.type = type ?? post.type;
    post.hashtags = hashtags ?? post.hashtags;
    post.save();

    // return the post
    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  }
});

/**
 * @desc - delete a post
 * @route - DELETE /api/v1/posts/:id
 * access - private
 */

export const deletePost = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  if (post.userId.toString() !== user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  await post.remove();

  res.status(200).json({
    success: true,
    data: {
      message: 'Post deleted',
    },
  });
});

