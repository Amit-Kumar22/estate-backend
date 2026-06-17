import { Request, Response } from 'express';
import slugify from 'slugify';
import Blog from '../models/Blog';
import { catchAsync, createError } from '../middlewares/errorHandler';
import path from 'path';
import fs from 'fs';

// Get all blogs (Public - only published and active)
export const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const { category, tag, page = 1, limit = 10, search, status } = req.query;
  const query: Record<string, unknown> = { isActive: true };

  // Only show published blogs to public
  if (!status) {
    query.status = 'published';
  }

  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (search) query.$text = { $search: search as string };

  const skip = (Number(page) - 1) * Number(limit);
  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Blog.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: blogs.length,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
    data: { blogs },
  });
});

// Get all blogs for admin (includes drafts)
export const getAllBlogsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { category, tag, page = 1, limit = 10, search, status } = req.query;
  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (search) query.$text = { $search: search as string };

  const skip = (Number(page) - 1) * Number(limit);
  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Blog.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: blogs.length,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
    data: { blogs },
  });
});

// Get blog by slug (Public)
export const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    status: 'published',
    isActive: true,
  });

  if (!blog) {
    throw createError('Blog not found.', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { blog },
  });
});

// Get blog by ID (Admin)
export const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw createError('Blog not found.', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { blog },
  });
});

const normalizeUploadPath = (filePath: string): string => {
  const sanitized = filePath.replace(/\\/g, '/').replace(/^\//, '');
  return `/${sanitized}`;
};

const getLocalFilePath = (publicPath: string): string => {
  const sanitized = publicPath.split('?')[0].replace(/\\/g, '/').replace(/^\//, '');
  return path.join(process.cwd(), sanitized);
};

// Create new blog
export const createBlog = catchAsync(async (req: Request, res: Response) => {
  const blogData = { ...req.body };

  // Generate slug from title
  if (!blogData.slug && blogData.title) {
    blogData.slug = slugify(blogData.title, { lower: true, strict: true });
  }

  // Check if slug already exists
  const existingBlog = await Blog.findOne({ slug: blogData.slug });
  if (existingBlog) {
    throw createError('A blog with this slug already exists.', 400);
  }

  // Handle featured image upload
if (req.file) {
  blogData.featuredImage = normalizeUploadPath(`uploads/images/${req.file.filename}`);
  blogData.featuredImage += `?v=${Date.now()}`;
}

  // Parse tags if sent as string
  if (typeof blogData.tags === 'string') {
    blogData.tags = blogData.tags.split(',').map((tag: string) => tag.trim());
  }

  const blog = await Blog.create(blogData);

  res.status(201).json({
    status: 'success',
    data: { blog },
  });
});

// Update blog
export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw createError('Blog not found.', 404);
  }

  const updateData = { ...req.body };

  // Update slug if title changed
  if (updateData.title && updateData.title !== blog.title) {
    const newSlug = slugify(updateData.title, { lower: true, strict: true });
    
    // Check if new slug already exists
    const existingBlog = await Blog.findOne({ 
      slug: newSlug, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingBlog) {
      throw createError('A blog with this slug already exists.', 400);
    }
    
    updateData.slug = newSlug;
  }

  // Handle featured image upload
  if (req.file) {
    // Delete old image if exists
    if (blog.featuredImage) {
      const oldImagePath = getLocalFilePath(blog.featuredImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.featuredImage = normalizeUploadPath(`uploads/blog-images/${req.file.filename}`);
    updateData.featuredImage += `?v=${Date.now()}`;
  }

  // Parse tags if sent as string
  if (typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map((tag: string) => tag.trim());
  }

  Object.assign(blog, updateData);
  await blog.save();

  res.status(200).json({
    status: 'success',
    data: { blog },
  });
});

// Delete blog
export const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw createError('Blog not found.', 404);
  }

  // Delete featured image
  if (blog.featuredImage) {
    const imagePath = getLocalFilePath(blog.featuredImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await blog.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Toggle blog status (published/draft)
export const toggleBlogStatus = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw createError('Blog not found.', 404);
  }

  blog.status = blog.status === 'published' ? 'draft' : 'published';
  
  // Update publish date when publishing
  if (blog.status === 'published' && !blog.publishDate) {
    blog.publishDate = new Date();
  }
  
  await blog.save();

  res.status(200).json({
    status: 'success',
    data: { blog },
  });
});

// Get all categories (for dropdown)
export const getBlogCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await Blog.distinct('category');

  res.status(200).json({
    status: 'success',
    data: { categories },
  });
});

// Get all tags (for dropdown)
export const getBlogTags = catchAsync(async (req: Request, res: Response) => {
  const tags = await Blog.distinct('tags');

  res.status(200).json({
    status: 'success',
    data: { tags },
  });
});
