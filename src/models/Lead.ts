import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  name: string;
  mobile: string;
  email: string;
  source: 'contact' | 'brochure' | 'unlock_content' | 'project_detail';
  project?: mongoose.Types.ObjectId;
  projectName?: string;
  message?: string;
  unlockedContent?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    source: {
      type: String,
      enum: ['contact', 'brochure', 'unlock_content', 'project_detail'],
      required: true,
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    message: { type: String },
    unlockedContent: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ source: 1 });
leadSchema.index({ project: 1 });
leadSchema.index({ email: 1 });

export default mongoose.model<ILead>('Lead', leadSchema);
