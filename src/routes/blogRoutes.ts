import { Router } from 'express';
import {
  getAllBlogs,
  getAllBlogsAdmin,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  getBlogCategories,
  getBlogTags,
} from '../controllers/blogController';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public routes
router.get('/categories', getBlogCategories);
router.get('/tags', getBlogTags);
router.get('/slug/:slug', getBlogBySlug);
router.get('/', getAllBlogs);

// Protected routes (Admin only)
router.use(protect);
router.get('/admin/all', getAllBlogsAdmin);
router.get('/:id', getBlogById);
router.post('/', upload.single('featuredImage'), createBlog);
router.patch('/:id', upload.single('featuredImage'), updateBlog);
router.delete('/:id', deleteBlog);
router.patch('/:id/toggle-status', toggleBlogStatus);

export default router;
