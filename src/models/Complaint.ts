import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  adminNote?: string;
  emailVerified: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
    adminNote: { type: String, trim: true },
    emailVerified: { type: Boolean, default: false },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ email: 1 });

export default mongoose.model<IComplaint>('Complaint', complaintSchema);
