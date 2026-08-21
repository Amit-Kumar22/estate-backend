import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaintOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

const complaintOTPSchema = new Schema<IComplaintOTP>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
complaintOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
complaintOTPSchema.index({ email: 1 });

export default mongoose.model<IComplaintOTP>('ComplaintOTP', complaintOTPSchema);
