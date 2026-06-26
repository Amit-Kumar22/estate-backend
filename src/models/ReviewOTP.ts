import mongoose, { Document, Schema } from 'mongoose';

export interface IReviewOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

const reviewOTPSchema = new Schema<IReviewOTP>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs after 15 minutes
reviewOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
reviewOTPSchema.index({ email: 1 });

export default mongoose.model<IReviewOTP>('ReviewOTP', reviewOTPSchema);
