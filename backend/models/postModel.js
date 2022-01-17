import mongoose from 'mongoose';

const {
  ObjectId
} = mongoose.Schema.Types;


const replySchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  reply: {
    type: String,
    required: true,
  },
  commentId: {
    type: ObjectId,
    ref: 'Comment',
    required: true,
  },
}, {
  timestamps: true,
});

const commentSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: ObjectId,
    ref: 'Post',
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  replies: [replySchema],
}, {
  timestamps: true,
});

const likeSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: ObjectId,
    ref: 'Post',
    required: true,
  },
}, {
  timestamps: true,
});


const postSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  images: [],
  videos: [],
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'text'],
    default: 'text',
  },
  comments: [commentSchema],
  likes: [likeSchema],
  shares: {
    type: Number,
    default: 0,
  },
  hashtags: [],
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

export default Post;