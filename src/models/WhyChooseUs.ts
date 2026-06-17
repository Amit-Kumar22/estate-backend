import mongoose, { Document, Schema } from 'mongoose';

export interface IWhyChooseUs extends Document {
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const whyChooseUsSchema = new Schema<IWhyChooseUs>(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'], 
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: { 
      type: String, 
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: { 
      type: String, 
      required: [true, 'Icon/Image is required'] 
    },
    order: { 
      type: Number, 
      default: 0,
      min: [0, 'Order cannot be negative']
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { 
    timestamps: true 
  }
);

// Indexes for performance
whyChooseUsSchema.index({ order: 1 });
whyChooseUsSchema.index({ isActive: 1 });

export default mongoose.model<IWhyChooseUs>('WhyChooseUs', whyChooseUsSchema);
