import { Router } from 'express';
import {
  getAllPublicReviews, getAllPublicReviewsAdmin, getPublicReviewById,
  createPublicReview, updatePublicReview, deletePublicReview,
} from '../controllers/publicReviewController';
import { protect } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

// Public
router.get('/', getAllPublicReviews);

// Protected
router.use(protect);
router.get('/admin/all', getAllPublicReviewsAdmin);
router.post('/', uploadSingle('thumbnail'), createPublicReview);
router.route('/:id')
  .get(getPublicReviewById)
  .patch(uploadSingle('thumbnail'), updatePublicReview)
  .delete(deletePublicReview);

export default router;
