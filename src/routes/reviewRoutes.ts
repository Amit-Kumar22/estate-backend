import { Router } from 'express';
import {
  sendOTP,
  verifyOTP,
  createReview,
  getPublicReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/', createReview);
router.get('/public', getPublicReviews);

// Admin-protected routes
router.use(protect);
router.get('/', getAllReviews);
router.patch('/:id/status', updateReviewStatus);
router.delete('/:id', deleteReview);

export default router;
