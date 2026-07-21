import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: string | object;
  updatedAt: Date;
}

export interface ISiteSettings {
  companyName: string;
  companyTagline: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  whatsappNumber: string;
  whatsappMessage: string;
  /** Multiple background videos — rendered as a carousel on the frontend hero section */
  heroVideoUrls: string[];
  /** Multiple background images — rendered as a carousel on the frontend hero section */
  heroBackgroundImages: string[];
  heroHeadline: string;
  heroSubheadline: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  metaTitle: string;
  metaDescription: string;
  logoUrl: string;
  faviconUrl: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// key unique index is already created by `unique: true` in the field definition above.
export default mongoose.model<ISettings>('Settings', settingsSchema);
