import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect } from '../middlewares/auth';
import { uploadMediaFields } from '../middlewares/upload';

const router = Router();

router.get('/', getSettings);
router.patch(
  '/',
  protect,
  uploadMediaFields([
    { name: 'file', maxCount: 1 },
    { name: 'heroVideos', maxCount: 10 },
    { name: 'heroImages', maxCount: 20 },
  ]),
  updateSettings
);

export default router;
