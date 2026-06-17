import { Request, Response } from 'express';
import WhyChooseUs from '../models/WhyChooseUs';
import { catchAsync, createError } from '../middlewares/errorHandler';
import fs from 'fs';
import path from 'path';

/**
 * Get all active Why Choose Us items (Public)
 * Used on the home page to display active items sorted by order
 */
export const getAllWhyChooseUs = catchAsync(async (_req: Request, res: Response) => {
  const items = await WhyChooseUs.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  
  res.status(200).json({ 
    status: 'success', 
    results: items.length, 
    data: { items } 
  });
});

/**
 * Get all Why Choose Us items (Admin only)
 * Returns both active and inactive items for management
 */
export const getAllWhyChooseUsAdmin = catchAsync(async (_req: Request, res: Response) => {
  const items = await WhyChooseUs.find().sort({ order: 1, createdAt: 1 });
  
  res.status(200).json({ 
    status: 'success', 
    results: items.length, 
    data: { items } 
  });
});

/**
 * Get single Why Choose Us item by ID
 */
export const getWhyChooseUsById = catchAsync(async (req: Request, res: Response) => {
  const item = await WhyChooseUs.findById(req.params.id);
  
  if (!item) {
    throw createError('Why Choose Us item not found.', 404);
  }
  
  res.status(200).json({ 
    status: 'success', 
    data: { item } 
  });
});

/**
 * Create new Why Choose Us item
 * Requires image upload and validates required fields
 */
export const createWhyChooseUs = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const { title, description, order, isActive } = req.body;

  // Validate required fields
  if (!title || !description) {
    throw createError('Title and description are required.', 400);
  }

  if (!file) {
    throw createError('Please upload an icon/image.', 400);
  }

  // Create new item
  const item = await WhyChooseUs.create({
    title,
    description,
    icon: `/uploads/images/${file.filename}`,
    order: Number(order) || 0,
    isActive: isActive === 'true' || isActive === true,
  });

  res.status(201).json({ 
    status: 'success', 
    data: { item },
    message: 'Why Choose Us item created successfully'
  });
});

/**
 * Update existing Why Choose Us item
 * Handles image replacement and deletes old image if new one is uploaded
 */
export const updateWhyChooseUs = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const body = { ...req.body };

  // Convert isActive to boolean if provided
  if (body.isActive !== undefined) {
    body.isActive = body.isActive === 'true' || body.isActive === true;
  }

  // Convert order to number if provided
  if (body.order !== undefined) {
    body.order = Number(body.order);
  }

  // Handle new image upload
  if (file) {
    const existing = await WhyChooseUs.findById(req.params.id);
    
    // Delete old image file if exists
    if (existing?.icon) {
      const localPath = path.join(process.cwd(), existing.icon);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
    
    body.icon = `/uploads/images/${file.filename}`;
  }

  // Update item
  const item = await WhyChooseUs.findByIdAndUpdate(
    req.params.id, 
    body, 
    {
      new: true,
      runValidators: true,
    }
  );

  if (!item) {
    throw createError('Why Choose Us item not found.', 404);
  }

  res.status(200).json({ 
    status: 'success', 
    data: { item },
    message: 'Why Choose Us item updated successfully'
  });
});

/**
 * Delete Why Choose Us item
 * Also removes the associated image file from storage
 */
export const deleteWhyChooseUs = catchAsync(async (req: Request, res: Response) => {
  const item = await WhyChooseUs.findById(req.params.id);
  
  if (!item) {
    throw createError('Why Choose Us item not found.', 404);
  }

  // Delete associated image file
  if (item.icon) {
    const localPath = path.join(process.cwd(), item.icon);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  // Delete from database
  await WhyChooseUs.findByIdAndDelete(req.params.id);

  res.status(200).json({ 
    status: 'success', 
    message: 'Why Choose Us item deleted successfully' 
  });
});

/**
 * Toggle active status of Why Choose Us item
 * Quick way to enable/disable items without full update
 */
export const toggleWhyChooseUsStatus = catchAsync(async (req: Request, res: Response) => {
  const item = await WhyChooseUs.findById(req.params.id);
  
  if (!item) {
    throw createError('Why Choose Us item not found.', 404);
  }

  item.isActive = !item.isActive;
  await item.save();

  res.status(200).json({ 
    status: 'success', 
    data: { item },
    message: `Item ${item.isActive ? 'activated' : 'deactivated'} successfully`
  });
});
