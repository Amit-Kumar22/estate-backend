import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import Settings from '../models/Settings';
import { catchAsync } from '../middlewares/errorHandler';

/**
 * Hero videos are stored on disk under `uploads/videos/` relative to the
 * process cwd (see middlewares/upload.ts, which uses the same cwd-relative
 * path). When a video is dropped from heroVideoUrls, delete the underlying
 * file too so it isn't left orphaned on disk/still servable at its old URL.
 */
const deleteUploadedFile = async (fileUrl: string): Promise<void> => {
  if (typeof fileUrl !== 'string' || !fileUrl.startsWith('/uploads/')) return;

  const absolutePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Failed to delete hero video file at ${absolutePath}:`, err);
    }
  }
};

const DEFAULT_SETTINGS = {
  companyName: 'Real Estate Platform',
  companyTagline: 'Building Dreams, Creating Homes',
  companyEmail: 'info@realestate.com',
  companyPhone: '+91 99999 99999',
  companyAddress: 'Mumbai, Maharashtra, India',
  whatsappNumber: '919999999999',
  whatsappMessage: 'Hello, I am interested in your projects. Please get in touch.',
  heroVideoUrls: [] as string[],
  heroBackgroundImages: [] as string[],
  heroHeadline: 'Building Dreams Since 2011',
  heroSubheadline: 'Premium residential and commercial developments.',
  heroStat1Value: '',
  heroStat1Label: '',
  heroStat2Value: '',
  heroStat2Label: '',
  heroStat3Value: '',
  heroStat3Label: '',
  metaTitle: 'Real Estate Platform - Premium Properties',
  metaDescription: 'Explore premium residential projects across India.',
  logoUrl: '',
  faviconUrl: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
};

/**
 * heroVideoUrl / heroBackgroundImage used to be single strings. Fold any
 * legacy value into the new list fields so existing settings docs don't
 * silently lose the video/image an admin already configured.
 */
const normalizeHeroMediaLists = (value: Record<string, unknown>): Record<string, unknown> => {
  const normalized = { ...value };

  if (!Array.isArray(normalized.heroVideoUrls)) {
    const legacy = typeof normalized.heroVideoUrl === 'string' ? normalized.heroVideoUrl.trim() : '';
    normalized.heroVideoUrls = legacy ? [legacy] : [];
  }
  delete normalized.heroVideoUrl;

  if (!Array.isArray(normalized.heroBackgroundImages)) {
    const legacy = typeof normalized.heroBackgroundImage === 'string' ? normalized.heroBackgroundImage.trim() : '';
    normalized.heroBackgroundImages = legacy ? [legacy] : [];
  }
  delete normalized.heroBackgroundImage;

  return normalized;
};

export const getSettings = catchAsync(async (_req: Request, res: Response) => {
  const settingsDoc = await Settings.findOne({ key: 'site_settings' });
  const settings = normalizeHeroMediaLists(
    (settingsDoc?.value as Record<string, unknown>) || DEFAULT_SETTINGS
  );
  res.status(200).json({ status: 'success', data: { settings } });
});

export const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const body = { ...req.body };

  // Parse socialLinks / hero media lists if sent as JSON strings (always the
  // case here, since this route only accepts multipart/form-data requests)
  if (body.socialLinks && typeof body.socialLinks === 'string') {
    try { body.socialLinks = JSON.parse(body.socialLinks); } catch { /* ignore */ }
  }
  if (body.heroVideoUrls && typeof body.heroVideoUrls === 'string') {
    try { body.heroVideoUrls = JSON.parse(body.heroVideoUrls); } catch { /* ignore */ }
  }
  if (body.heroBackgroundImages && typeof body.heroBackgroundImages === 'string') {
    try { body.heroBackgroundImages = JSON.parse(body.heroBackgroundImages); } catch { /* ignore */ }
  }

  const logoOrFaviconFile = files?.file?.[0];
  if (logoOrFaviconFile) {
    const field = req.query.field as string;
    if (field === 'logo') body.logoUrl = `/uploads/images/${logoOrFaviconFile.filename}`;
    if (field === 'favicon') body.faviconUrl = `/uploads/images/${logoOrFaviconFile.filename}`;
  }

  const existing = await Settings.findOne({ key: 'site_settings' });
  const currentValue = normalizeHeroMediaLists((existing?.value as Record<string, unknown>) || {});

  // Newly uploaded hero videos/images are appended to whichever list the
  // admin already retained (body.heroVideoUrls/heroBackgroundImages reflects
  // any entries removed client-side before saving).
  const uploadedVideoUrls = (files?.heroVideos ?? []).map((f) => `/uploads/videos/${f.filename}`);
  const uploadedImageUrls = (files?.heroImages ?? []).map((f) => `/uploads/images/${f.filename}`);

  if (uploadedVideoUrls.length) {
    const retained = Array.isArray(body.heroVideoUrls)
      ? (body.heroVideoUrls as string[])
      : (currentValue.heroVideoUrls as string[]);
    body.heroVideoUrls = [...retained, ...uploadedVideoUrls];
  }
  if (uploadedImageUrls.length) {
    const retained = Array.isArray(body.heroBackgroundImages)
      ? (body.heroBackgroundImages as string[])
      : (currentValue.heroBackgroundImages as string[]);
    body.heroBackgroundImages = [...retained, ...uploadedImageUrls];
  }

  const updated = normalizeHeroMediaLists({ ...currentValue, ...body });

  // Any hero video URL present before this update but missing from the final
  // list was removed by the admin (or replaced) — delete its file from disk.
  const previousVideoUrls = Array.isArray(currentValue.heroVideoUrls)
    ? (currentValue.heroVideoUrls as string[])
    : [];
  const nextVideoUrls = Array.isArray(updated.heroVideoUrls)
    ? (updated.heroVideoUrls as string[])
    : [];
  const removedVideoUrls = previousVideoUrls.filter((url) => !nextVideoUrls.includes(url));

  const settings = await Settings.findOneAndUpdate(
    { key: 'site_settings' },
    { key: 'site_settings', value: updated },
    { new: true, upsert: true }
  );

  if (removedVideoUrls.length) {
    await Promise.all(removedVideoUrls.map(deleteUploadedFile));
  }

  res.status(200).json({ status: 'success', data: { settings: settings.value } });
});
