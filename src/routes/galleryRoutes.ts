import { Router } from 'express';
import {
  getAllGallery, getGalleryCategories, uploadGalleryImage,
  updateGalleryImage, deleteGalleryImage, reorderGallery,
} from '../controllers/galleryController';
import { protect } from '../middlewares/auth';
import { uploadMultiple, uploadSingle } from '../middlewares/upload';

const router = Router();

// Public
router.get('/', getAllGallery);
router.get('/categories', getGalleryCategories);

// Protected
router.use(protect);
router.post('/', uploadMultiple('images', 20), uploadGalleryImage);
router.patch('/reorder', reorderGallery);
router.route('/:id').patch(uploadSingle('image'), updateGalleryImage).delete(deleteGalleryImage);

export default router;
