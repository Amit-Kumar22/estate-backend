import { Router } from 'express';
import {
  getAllWhyChooseUs,
  getAllWhyChooseUsAdmin,
  getWhyChooseUsById,
  createWhyChooseUs,
  updateWhyChooseUs,
  deleteWhyChooseUs,
  toggleWhyChooseUsStatus,
} from '../controllers/whyChooseUsController';
import { protect } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
// Get all active Why Choose Us items (for home page display)
router.get('/', getAllWhyChooseUs);

// ─── Protected Routes (Admin Only) ──────────────────────────────────────────
router.use(protect);

// Get all items (including inactive) for admin management
router.get('/admin/all', getAllWhyChooseUsAdmin);

// Create new Why Choose Us item with image upload
router.post('/', uploadSingle('icon'), createWhyChooseUs);

// Item-specific operations
router.route('/:id')
  .get(getWhyChooseUsById)
  .patch(uploadSingle('icon'), updateWhyChooseUs)
  .delete(deleteWhyChooseUs);

// Toggle active/inactive status
router.patch('/:id/toggle-status', toggleWhyChooseUsStatus);

export default router;
