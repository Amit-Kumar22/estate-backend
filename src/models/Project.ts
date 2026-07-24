import mongoose, { Document, Schema } from 'mongoose';

export interface IConfiguration {
  type: string;
  area: string;
  price: string;
}

export interface IGalleryImage {
  url: string;
  caption?: string;
  category?: string;
}

export interface IProject extends Document {
  name: string;
  slug: string;
  status: 'current' | 'upcoming' | 'completed';
  priority: number;
  location: string;
  latitude: number;
  longitude: number;
  price: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  amenities: string[];
  configuration: IConfiguration[];
  possessionDate: string;
  heroImages: string[];
  galleryImages: IGalleryImage[];
  floorPlans: string[];
  interiorPhotos: string[];
  virtualTourUrl?: string;
  brochureUrl?: string;
  featured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const configurationSchema = new Schema<IConfiguration>({
  type: { type: String, required: true },
  area: { type: String, required: true },
  price: { type: String, required: true },
});

const galleryImageSchema = new Schema<IGalleryImage>({
  url: { type: String, required: true },
  caption: { type: String },
  category: { type: String, default: 'general' },
});

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    status: {
      type: String,
      enum: ['current', 'upcoming', 'completed'],
      default: 'current',
    },
    priority: { type: Number, default: 0 },
    location: { type: String, required: true },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    price: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    amenities: [{ type: String }],
    configuration: [configurationSchema],
    possessionDate: { type: String },
    heroImages: [{ type: String }],
    galleryImages: [galleryImageSchema],
    floorPlans: [{ type: String }],
    interiorPhotos: [{ type: String }],
    virtualTourUrl: { type: String },
    brochureUrl: { type: String },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// slug unique index is already created by `unique: true` in the field definition above.
// Only add the non-unique indexes here.
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ name: 'text', location: 'text', description: 'text' });

export default mongoose.model<IProject>('Project', projectSchema);
