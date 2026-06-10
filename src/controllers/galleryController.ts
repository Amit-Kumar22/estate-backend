import { Request, Response } from 'express';
import Gallery from '../models/Gallery';
import { catchAsync, createError } from '../middlewares/errorHandler';
import fs from 'fs';
import path from 'path';

export const getAllGallery = catchAsync(async (req: Request, res: Response) => {
  const { category, featured } = req.query;
  const query: Record<string, unknown> = {};
  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';

  const images = await Gallery.find(query).sort({ order: 1, createdAt: -1 });
  res.status(200).json({ status: 'success', results: images.length, data: { images } });
});

export const getGalleryCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await Gallery.distinct('category');
  res.status(200).json({ status: 'success', data: { categories } });
});

export const uploadGalleryImage = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const { caption, category, featured, order } = req.body;

  if (!files || files.length === 0) {
    throw createError('Please upload at least one image.', 400);
  }

  const images = await Promise.all(
    files.map((file) =>
      Gallery.create({
        url: `/uploads/images/${file.filename}`,
        caption,
        category: category || 'general',
        featured: featured === 'true',
        order: Number(order) || 0,
      })
    )
  );

  res.status(201).json({ status: 'success', results: images.length, data: { images } });
});

export const updateGalleryImage = catchAsync(async (req: Request, res: Response) => {
  const { caption, category, featured, order } = req.body;
  const image = await Gallery.findByIdAndUpdate(
    req.params.id,
    { caption, category, featured: featured === 'true' || featured === true, order },
    { new: true, runValidators: true }
  );
  if (!image) throw createError('Image not found.', 404);
  res.status(200).json({ status: 'success', data: { image } });
});

export const deleteGalleryImage = catchAsync(async (req: Request, res: Response) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) throw createError('Image not found.', 404);

  const localPath = path.join(process.cwd(), image.url);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

  await Gallery.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Image deleted successfully' });
});

export const reorderGallery = catchAsync(async (req: Request, res: Response) => {
  const { items } = req.body as { items: { id: string; order: number }[] };
  await Promise.all(
    items.map(({ id, order }) => Gallery.findByIdAndUpdate(id, { order }))
  );
  res.status(200).json({ status: 'success', message: 'Gallery reordered successfully' });
});
