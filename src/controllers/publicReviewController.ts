import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import PublicReview from '../models/PublicReview';
import { catchAsync, createError } from '../middlewares/errorHandler';

export const getAllPublicReviews = catchAsync(async (_req: Request, res: Response) => {
  const publicReviews = await PublicReview.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.status(200).json({ status: 'success', results: publicReviews.length, data: { publicReviews } });
});

export const getAllPublicReviewsAdmin = catchAsync(async (_req: Request, res: Response) => {
  const publicReviews = await PublicReview.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json({ status: 'success', results: publicReviews.length, data: { publicReviews } });
});

export const getPublicReviewById = catchAsync(async (req: Request, res: Response) => {
  const publicReview = await PublicReview.findById(req.params.id);
  if (!publicReview) throw createError('Public review not found.', 404);
  res.status(200).json({ status: 'success', data: { publicReview } });
});

export const createPublicReview = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const { name, quote, videoUrl, order, isActive } = req.body;

  if (!file) throw createError('Please upload a thumbnail image.', 400);
  if (!videoUrl?.trim()) throw createError('Video URL is required.', 400);

  const publicReview = await PublicReview.create({
    name,
    quote,
    videoUrl: videoUrl.trim(),
    thumbnail: `/uploads/images/${file.filename}`,
    order: Number(order) || 0,
    isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
  });

  res.status(201).json({ status: 'success', data: { publicReview } });
});

export const updatePublicReview = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const body: Record<string, unknown> = { ...req.body };

  if (body.isActive !== undefined) {
    body.isActive = body.isActive === 'true' || body.isActive === true;
  }
  if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
  }

  if (file) {
    const existing = await PublicReview.findById(req.params.id);
    if (existing?.thumbnail) {
      const localPath = path.join(process.cwd(), existing.thumbnail);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
    body.thumbnail = `/uploads/images/${file.filename}`;
  }

  const publicReview = await PublicReview.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!publicReview) throw createError('Public review not found.', 404);

  res.status(200).json({ status: 'success', data: { publicReview } });
});

export const deletePublicReview = catchAsync(async (req: Request, res: Response) => {
  const publicReview = await PublicReview.findById(req.params.id);
  if (!publicReview) throw createError('Public review not found.', 404);

  if (publicReview.thumbnail) {
    const localPath = path.join(process.cwd(), publicReview.thumbnail);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }

  await PublicReview.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Public review deleted successfully' });
});
