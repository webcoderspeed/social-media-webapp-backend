import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const {
  ObjectId
} = mongoose.Schema.Types;

const followersSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  }
});


const followingSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  }
});



const userSchema = mongoose.Schema({
  userId: {
    type: String,
  },
  backgroundImage: [],
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  profilePic: [],
  followers: [followersSchema],
  followings: [followingSchema],
  bio: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  website: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;