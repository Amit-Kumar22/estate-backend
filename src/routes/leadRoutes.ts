import { Router } from 'express';
import {
  createLead, getAllLeads, getLeadById, deleteLead,
  exportLeadsCSV, getTodayLeads,
} from '../controllers/leadController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public
router.post('/', createLead);

// Protected
router.use(protect);
router.get('/', getAllLeads);
router.get('/today', getTodayLeads);
router.get('/export/csv', exportLeadsCSV);
router.route('/:id').get(getLeadById).delete(deleteLead);

export default router;
