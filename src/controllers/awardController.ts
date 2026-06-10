import { Request, Response } from 'express';
import Award from '../models/Award';
import { catchAsync, createError } from '../middlewares/errorHandler';
import fs from 'fs';
import path from 'path';

export const getAllAwards = catchAsync(async (_req: Request, res: Response) => {
  const awards = await Award.find({ isActive: true }).sort({ order: 1, year: -1 });
  res.status(200).json({ status: 'success', results: awards.length, data: { awards } });
});

export const getAllAwardsAdmin = catchAsync(async (_req: Request, res: Response) => {
  const awards = await Award.find().sort({ order: 1, year: -1 });
  res.status(200).json({ status: 'success', results: awards.length, data: { awards } });
});

export const getAwardById = catchAsync(async (req: Request, res: Response) => {
  const award = await Award.findById(req.params.id);
  if (!award) throw createError('Award not found.', 404);
  res.status(200).json({ status: 'success', data: { award } });
});

export const createAward = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const { title, year, description, organization, order } = req.body;

  if (!file) throw createError('Please upload an award image.', 400);

  const award = await Award.create({
    title,
    year,
    description,
    organization,
    image: `/uploads/images/${file.filename}`,
    order: Number(order) || 0,
  });

  res.status(201).json({ status: 'success', data: { award } });
});

export const updateAward = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const body = { ...req.body };

  if (file) {
    const existing = await Award.findById(req.params.id);
    if (existing?.image) {
      const localPath = path.join(process.cwd(), existing.image);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
    body.image = `/uploads/images/${file.filename}`;
  }

  const award = await Award.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!award) throw createError('Award not found.', 404);

  res.status(200).json({ status: 'success', data: { award } });
});

export const deleteAward = catchAsync(async (req: Request, res: Response) => {
  const award = await Award.findById(req.params.id);
  if (!award) throw createError('Award not found.', 404);

  if (award.image) {
    const localPath = path.join(process.cwd(), award.image);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }

  await Award.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Award deleted successfully' });
});
