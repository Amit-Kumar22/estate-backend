import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import Settings from '../models/Settings';
import Project from '../models/Project';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate';

const seedData = async (): Promise<void> => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Seed Admin
  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@realestate.com' });
  if (!existingAdmin) {
    await Admin.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@realestate.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'super_admin',
    });
    console.log('✅ Admin created:', process.env.ADMIN_EMAIL);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed Default Settings
  const existingSettings = await Settings.findOne({ key: 'site_settings' });
  if (!existingSettings) {
    await Settings.create({
      key: 'site_settings',
      value: {
        companyName: 'Real Estate Platform',
        companyTagline: 'Building Dreams, Creating Homes',
        companyEmail: 'info@realestate.com',
        companyPhone: '+91 99999 99999',
        companyAddress: 'Mumbai, Maharashtra, India',
        whatsappNumber: '919999999999',
        whatsappMessage: 'Hello, I am interested in your projects. Please get in touch.',
        heroVideoUrl: '',
        heroHeadline: 'Luxury Living Redefined',
        heroSubheadline: 'Discover premium residential projects crafted for discerning homebuyers',
        heroBackgroundImage: '',
        // Hero stats — set real values via Admin → Settings panel
        heroStat1Value: '', heroStat1Label: 'Projects Delivered',
        heroStat2Value: '', heroStat2Label: 'Happy Families',
        heroStat3Value: '', heroStat3Label: 'Years of Excellence',
        metaTitle: 'Real Estate Platform - Premium Properties',
        metaDescription: 'Explore premium residential projects across India.',
        logoUrl: '',
        faviconUrl: '',
        socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
      },
    });
    console.log('✅ Default settings created');
  }

  // Seed Sample Projects
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        name: 'The Grand Residences',
        slug: 'the-grand-residences',
        status: 'current',
        location: 'Bandra West, Mumbai',
        latitude: 19.0596,
        longitude: 72.8295,
        price: '₹2.5 Cr - ₹8 Cr',
        shortDescription: 'Luxury 3 & 4 BHK apartments with panoramic sea views in the heart of Bandra.',
        description: 'The Grand Residences redefines luxury living in Mumbai. Nestled in the prestigious Bandra West, these meticulously crafted homes offer the perfect blend of contemporary design and timeless elegance.',
        highlights: ['Sea View', 'Vastu Compliant', 'Premium Fittings', 'Smart Home'],
        amenities: ['Swimming Pool', 'Gymnasium', 'Club House', 'Landscaped Garden', 'Jogging Track', '24/7 Security', 'Power Backup', 'Parking'],
        configuration: [
          { type: '3 BHK', area: '1,850 sq.ft', price: '₹2.5 Cr onwards' },
          { type: '4 BHK', area: '2,800 sq.ft', price: '₹4.5 Cr onwards' },
          { type: 'Penthouse', area: '4,500 sq.ft', price: '₹8 Cr onwards' },
        ],
        possessionDate: 'December 2025',
        heroImages: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200'],
        featured: true,
        metaTitle: 'The Grand Residences - Luxury Apartments in Bandra West, Mumbai',
        metaDescription: 'Luxury 3 & 4 BHK apartments with panoramic sea views in Bandra West, Mumbai.',
      },
      {
        name: 'Emerald Heights',
        slug: 'emerald-heights',
        status: 'upcoming',
        location: 'Whitefield, Bangalore',
        latitude: 12.9698,
        longitude: 77.7499,
        price: '₹1.2 Cr - ₹3.5 Cr',
        shortDescription: 'Premium 2 & 3 BHK apartments with world-class amenities in IT hub.',
        description: 'Emerald Heights is a premium residential project located in the thriving IT hub of Whitefield, Bangalore. Designed for the modern professional, each home is crafted with precision and care.',
        highlights: ['IT Hub Location', 'Green Building', 'Smart Security', 'Clubhouse'],
        amenities: ['Swimming Pool', 'Gym', 'Co-working Space', 'Kids Play Area', 'Tennis Court', 'Cafeteria'],
        configuration: [
          { type: '2 BHK', area: '1,200 sq.ft', price: '₹1.2 Cr onwards' },
          { type: '3 BHK', area: '1,650 sq.ft', price: '₹2.1 Cr onwards' },
        ],
        possessionDate: 'March 2026',
        heroImages: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'],
        featured: true,
      },
    ]);
    console.log('✅ Sample projects created');
  }

  console.log('🎉 Seeding complete!');
  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seeding failed:-', err);
  process.exit(1);
});
