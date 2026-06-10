import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  url: string;
  publicId?: string;
  caption?: string;
  category: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    caption: { type: String },
    category: { type: String, default: 'general' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1 });
gallerySchema.index({ featured: 1 });
gallerySchema.index({ order: 1 });

export default mongoose.model<IGallery>('Gallery', gallerySchema);
