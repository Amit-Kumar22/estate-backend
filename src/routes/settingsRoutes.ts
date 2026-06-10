import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

router.get('/', getSettings);
router.patch('/', protect, uploadSingle('file'), updateSettings);

export default router;
