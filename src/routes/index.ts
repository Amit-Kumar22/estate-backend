import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import leadRoutes from './leadRoutes';
import galleryRoutes from './galleryRoutes';
import awardRoutes from './awardRoutes';
import dashboardRoutes from './dashboardRoutes';
import settingsRoutes from './settingsRoutes';
import whyChooseUsRoutes from './whyChooseUsRoutes';
import blogRoutes from './blogRoutes';
import reviewRoutes from './reviewRoutes';
import publicReviewRoutes from './publicReviewRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/leads', leadRoutes);
router.use('/gallery', galleryRoutes);
router.use('/awards', awardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/why-choose-us', whyChooseUsRoutes);
router.use('/blogs', blogRoutes);
router.use('/reviews', reviewRoutes);
router.use('/public-reviews', publicReviewRoutes);

export default router;
