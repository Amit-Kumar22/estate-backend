import { Router } from 'express';
import {
  getAllAwards, getAllAwardsAdmin, getAwardById,
  createAward, updateAward, deleteAward,
} from '../controllers/awardController';
import { protect } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

// Public
router.get('/', getAllAwards);

// Protected
router.use(protect);
router.get('/admin/all', getAllAwardsAdmin);
router.post('/', uploadSingle('image'), createAward);
router.route('/:id')
  .get(getAwardById)
  .patch(uploadSingle('image'), updateAward)
  .delete(deleteAward);

export default router;
