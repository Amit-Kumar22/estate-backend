import mongoose, { Document, Schema } from 'mongoose';

export interface IAward extends Document {
  title: string;
  year: string;
  description: string;
  image: string;
  organization?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const awardSchema = new Schema<IAward>(
  {
    title: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    organization: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

awardSchema.index({ order: 1 });
awardSchema.index({ year: -1 });

export default mongoose.model<IAward>('Award', awardSchema);
