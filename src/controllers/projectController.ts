import { Request, Response } from 'express';
import slugify from 'slugify';
import Project from '../models/Project';
import { catchAsync, createError } from '../middlewares/errorHandler';
import path from 'path';
import fs from 'fs';

export const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const { status, featured, page = 1, limit = 10, search } = req.query;
  const query: Record<string, unknown> = { isActive: true };

  if (status) query.status = status;
  if (featured !== undefined) query.featured = featured === 'true';
  if (search) query.$text = { $search: search as string };

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(query).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
    Project.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    data: { projects },
  });
});

export const getProjectBySlug = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findOne({ slug: req.params.slug, isActive: true });
  if (!project) throw createError('Project not found.', 404);
  res.status(200).json({ status: 'success', data: { project } });
});

export const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw createError('Project not found.', 404);
  res.status(200).json({ status: 'success', data: { project } });
});

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const body = req.body;

  if (!body.slug) {
    body.slug = slugify(body.name, { lower: true, strict: true });
  }

  // Parse JSON arrays
  ['highlights', 'amenities', 'configuration', 'heroImages', 'floorPlans', 'interiorPhotos'].forEach((field) => {
    if (body[field] && typeof body[field] === 'string') {
      try { body[field] = JSON.parse(body[field]); } catch { /* ignore */ }
    }
  });

  // Handle file uploads
  if (files?.heroImages) {
    body.heroImages = (body.heroImages || []).concat(
      files.heroImages.map((f) => `/uploads/images/${f.filename}`)
    );
  }
  if (files?.brochure?.[0]) {
    body.brochureUrl = `/uploads/documents/${files.brochure[0].filename}`;
  }

  const project = await Project.create(body);
  res.status(201).json({ status: 'success', data: { project } });
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const body = { ...req.body };

  ['highlights', 'amenities', 'configuration', 'heroImages', 'floorPlans', 'interiorPhotos'].forEach((field) => {
    if (body[field] && typeof body[field] === 'string') {
      try { body[field] = JSON.parse(body[field]); } catch { /* ignore */ }
    }
  });

  if (files?.heroImages) {
    const newImages = files.heroImages.map((f) => `/uploads/images/${f.filename}`);
    body.heroImages = [...(body.heroImages || []), ...newImages];
  }
  if (files?.brochure?.[0]) {
    body.brochureUrl = `/uploads/documents/${files.brochure[0].filename}`;
  }

  const project = await Project.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!project) throw createError('Project not found.', 404);

  res.status(200).json({ status: 'success', data: { project } });
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw createError('Project not found.', 404);
  await Project.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
});

export const getProjectsForMap = catchAsync(async (_req: Request, res: Response) => {
  const projects = await Project.find({ isActive: true })
    .select('name slug location latitude longitude status price heroImages shortDescription')
    .sort({ featured: -1 });
  res.status(200).json({ status: 'success', data: { projects } });
});

export const getFeaturedProjects = catchAsync(async (_req: Request, res: Response) => {
  const projects = await Project.find({ isActive: true, featured: true })
    .sort({ createdAt: -1 })
    .limit(8);
  res.status(200).json({ status: 'success', data: { projects } });
});

export const deleteProjectImage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { imageUrl, field } = req.body;

  const project = await Project.findById(id);
  if (!project) throw createError('Project not found.', 404);

  const localPath = path.join(process.cwd(), imageUrl);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

  const fieldName = field as 'heroImages' | 'floorPlans' | 'interiorPhotos';
  if (Array.isArray(project[fieldName])) {
    (project[fieldName] as string[]) = (project[fieldName] as string[]).filter((img) => img !== imageUrl);
    await project.save();
  }

  res.status(200).json({ status: 'success', message: 'Image deleted successfully' });
});
