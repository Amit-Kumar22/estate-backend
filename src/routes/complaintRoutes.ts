import { Router } from 'express';
import {
  sendComplaintOTP,
  verifyComplaintOTP,
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} from '../controllers/complaintController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public
router.post('/send-otp', sendComplaintOTP);
router.post('/verify-otp', verifyComplaintOTP);
router.post('/', createComplaint);

// Admin-protected
router.use(protect);
router.get('/', getAllComplaints);
router.route('/:id').get(getComplaintById).delete(deleteComplaint);
router.patch('/:id/status', updateComplaintStatus);

export default router;
