import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicReview extends Document {
  name: string;
  quote: string;
  thumbnail: string;
  videoUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const publicReviewSchema = new Schema<IPublicReview>(
  {
    name: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true, maxlength: 500 },
    thumbnail: { type: String, required: true },
    videoUrl: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

publicReviewSchema.index({ order: 1 });
publicReviewSchema.index({ isActive: 1 });

export default mongoose.model<IPublicReview>('PublicReview', publicReviewSchema);
