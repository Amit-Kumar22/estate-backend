import { Request, Response } from 'express';
import Settings from '../models/Settings';
import { catchAsync } from '../middlewares/errorHandler';

const DEFAULT_SETTINGS = {
  companyName: 'Real Estate Platform',
  companyTagline: 'Building Dreams, Creating Homes',
  companyEmail: 'info@realestate.com',
  companyPhone: '+91 99999 99999',
  companyAddress: 'Mumbai, Maharashtra, India',
  whatsappNumber: '919999999999',
  whatsappMessage: 'Hello, I am interested in your projects. Please get in touch.',
  heroVideoUrl: '',
  heroHeadline: 'Building Dreams Since 2011',
  heroSubheadline: 'Premium residential and commercial developments.',
  metaTitle: 'Real Estate Platform - Premium Properties',
  metaDescription: 'Explore premium residential projects across India.',
  logoUrl: '',
  faviconUrl: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
};

export const getSettings = catchAsync(async (_req: Request, res: Response) => {
  const settingsDoc = await Settings.findOne({ key: 'site_settings' });
  const settings = settingsDoc?.value || DEFAULT_SETTINGS;
  res.status(200).json({ status: 'success', data: { settings } });
});

export const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const body = { ...req.body };

  // Parse socialLinks if it's a string
  if (body.socialLinks && typeof body.socialLinks === 'string') {
    try { body.socialLinks = JSON.parse(body.socialLinks); } catch { /* ignore */ }
  }

  if (file) {
    const field = req.query.field as string;
    if (field === 'logo') body.logoUrl = `/uploads/images/${file.filename}`;
    if (field === 'favicon') body.faviconUrl = `/uploads/images/${file.filename}`;
  }

  const existing = await Settings.findOne({ key: 'site_settings' });
  const currentValue = (existing?.value as Record<string, unknown>) || {};
  const updated = { ...currentValue, ...body };

  const settings = await Settings.findOneAndUpdate(
    { key: 'site_settings' },
    { key: 'site_settings', value: updated },
    { new: true, upsert: true }
  );

  res.status(200).json({ status: 'success', data: { settings: settings.value } });
});
