import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  name: string;
  email: string;
  city?: string;
  rating: number;
  review: string;
  status: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    city: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ email: 1 });

export default mongoose.model<IReview>('Review', reviewSchema);
