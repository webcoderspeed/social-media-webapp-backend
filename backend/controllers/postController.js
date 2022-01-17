import Post from '../models/postModel.js';
import User from '../models/userModel.js';
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

  if (!caption) {
    return res.status(400).json({
      success: false,
      error: 'Caption is required',
    });
  }

  const hashtags = caption?.match(/#\w+/g) ?? [];
  const files = req?.files;

  const uploadedData = [];

  if (files && type === 'image') {
    const promises = files?.map(async (image) => {
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

    if (!files) {
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

    if (!files) {
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

  if (post.type === 'image') {
    const promises = post.images.map(async (image) => {
      await cloudinary.deleteImageOrVideo(image.public_id, post.type);
    })

    await Promise.all(promises).then(async (result) => {
      await post.remove();

      res.status(200).json({
        success: true,
        data: {
          message: 'Post deleted',
        },
      });
    }).catch(err => console.log(err));

  } else if (post.type === 'video') {
    const promises = post.videos.map(async (video) => {
      await cloudinary.deleteImageOrVideo(video.public_id, post.type);
    })

    await Promise.all(promises).then(async (result) => {
      await post.remove();

      res.status(200).json({
        success: true,
        data: {
          message: 'Post deleted',
        },
      });
    }).catch(err => console.log(err));
  } else {
    await post.remove();

    res.status(200).json({
      success: true,
      data: {
        message: 'Post deleted',
      },
    });
  }
});


/**
 * @desc - get post by user id
 * @route - GET /api/v1/posts/user/:id
 * @access - public
*/

export const getPostsByUserId = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const posts = await Post.find({ userId: user._id });

  if (!posts) {
    return res.status(404).json({
      success: false,
      error: 'No posts found',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      posts,
    },
  });
});

/**
 * @desc - comment on a post
 * @route - POST /api/v1/posts/:id/comment
 * @access - private
 */

export const commentOnPost = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const {
    comment,
  } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      error: 'Comment is required',
    });
  }

  const newComment = {
    userId: user._id,
    postId: post._id,
    comment,
  };

  post.comments.push(newComment);

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      comments: post.comments,
    },
  });
});


/**
 * @desc - delete a comment
 * @route - DELETE /api/v1/posts/:id/comment/:commentId
 * @access - private
 */

export const deleteComment = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  if (comment.userId.toString() !== user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  post.comments = post.comments.filter(comment => comment._id.toString() !== req.params.commentId);

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      comments: post.comments,
    },
  });
});

/**
 * @desc - update a comment
 * @route - PUT /api/v1/posts/:id/comment/:commentId
 * @access - private
 */

export const updateComment = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  if (comment.userId.toString() !== user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  const {
    comment: updatedComment
  } = req.body;

  comment.comment = updatedComment ?? comment.comment;

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      comments: post.comments,
    },
  });
});

/**
 * @desc - reply to a comment
 * @route - POST /api/v1/posts/:id/comment/:commentId/reply
 * @access - private
 */

export const replyToComment = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  const {
    reply,
  } = req.body;

  if (!reply) {
    return res.status(400).json({
      success: false,
      error: 'Reply is required',
    });
  }

  const newReply = {
    userId: user._id,
    commentId: comment._id,
    reply,
  };

  comment.replies.push(newReply);

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      replies: comment.replies,
    },
  });
});

/**
 * @desc - delete a reply
 * @route - DELETE /api/v1/posts/:id/comment/:commentId/reply/:replyId
 * @access - private
 */

export const deleteReply = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  const reply = comment.replies.find(reply => reply._id.toString() === req.params.replyId);

  if (!reply) {
    return res.status(404).json({
      success: false,
      error: 'Reply not found',
    });
  }

  if (reply.userId.toString() !== user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  comment.replies = comment.replies.filter(reply => reply._id.toString() !== req.params.replyId);

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      replies: comment.replies,
    },
  });
});

/**
 * @desc - update a reply
 * @route - PUT /api/v1/posts/:id/comment/:commentId/reply/:replyId
 * @access - private
 */

export const updateReply = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  const reply = comment.replies.find(reply => reply._id.toString() === req.params.replyId);

  if (!reply) {
    return res.status(404).json({
      success: false,
      error: 'Reply not found',
    });
  }

  if (reply.userId.toString() !== user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }

  const {
    reply: updatedReply
  } = req.body;

  reply.reply = updatedReply ?? reply.reply;

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      replies: comment.replies,
    },
  });
});

/**
 * @desc - like a post
 * @route - PUT /api/v1/posts/:id/like
 * @access - private
 */

export const likePost = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const like = post.likes.find(like => like.userId.toString() === user._id.toString());

  if (like) {
    return res.status(400).json({
      success: false,
      error: 'Post already liked',
    });
  }

  post.likes.push({
    userId: user._id,
    postId: post._id,
  });

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      likes: post.likes,
    },
  });
});

/**
 * @desc - unlike a post
 * @route - PUT /api/v1/posts/:id/unlike
 * @access - private
 */

export const unlikePost = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  const like = post.likes.find(like => like.userId.toString() === user._id.toString());

  if (!like) {
    return res.status(400).json({
      success: false,
      error: 'Post not liked',
    });
  }

  post.likes = post.likes.filter(like => like.userId.toString() !== user._id.toString());

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      likes: post.likes,
    },
  });
});

/** 
 * @desc - share a post
 * @route - PUT /api/v1/posts/:id/share
 * @access - private
*/

export const sharePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  post.shares++;

  await post.save();

  res.status(200).json({
    success: true,
    data: {
      shares: post.shares,
    },
  });
});

