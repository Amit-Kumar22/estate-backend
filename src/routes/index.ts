import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import leadRoutes from './leadRoutes';
import galleryRoutes from './galleryRoutes';
import awardRoutes from './awardRoutes';
import dashboardRoutes from './dashboardRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/leads', leadRoutes);
router.use('/gallery', galleryRoutes);
router.use('/awards', awardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;
