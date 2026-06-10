import { Router } from 'express';
import {
  login, logout, getMe, updatePassword,
  getAdmins, createAdmin, updateAdmin, deleteAdmin,
} from '../controllers/authController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/update-password', protect, updatePassword);

// Admin management (super_admin only)
router.use(protect, restrictTo('super_admin'));
router.route('/admins').get(getAdmins).post(createAdmin);
router.route('/admins/:id').patch(updateAdmin).delete(deleteAdmin);

export default router;
