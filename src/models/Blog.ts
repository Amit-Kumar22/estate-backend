import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  featuredImage: string;
  shortDescription: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  publishDate: Date;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  status: 'published' | 'draft';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    featuredImage: {
      type: String,
      required: [true, 'Featured image is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    seoMetaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'SEO meta title cannot exceed 60 characters'],
    },
    seoMetaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'SEO meta description cannot exceed 160 characters'],
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: slug index is already created by `unique: true` in the field definition
BlogSchema.index({ status: 1, isActive: 1 });
BlogSchema.index({ publishDate: -1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });

// Text search index
BlogSchema.index({ title: 'text', shortDescription: 'text', content: 'text' });

export default mongoose.model<IBlog>('Blog', BlogSchema);
