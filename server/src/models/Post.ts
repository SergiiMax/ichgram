import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    dominantColor: { type: String, required: true },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: imageSchema,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      maxLength: 2200,
      default: '',
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ author: 1, _id: -1 });

export const Post = mongoose.model('Post', postSchema);
