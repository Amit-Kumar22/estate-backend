import { Router } from 'express';
import {
  getAllProjects, getProjectBySlug, getProjectById, createProject,
  updateProject, deleteProject, getProjectsForMap, getFeaturedProjects,
  deleteProjectImage,
} from '../controllers/projectController';
import { protect } from '../middlewares/auth';
import { uploadFields } from '../middlewares/upload';

const router = Router();

// Public routes
router.get('/map', getProjectsForMap);
router.get('/featured', getFeaturedProjects);
router.get('/slug/:slug', getProjectBySlug);
router.get('/', getAllProjects);

// Protected routes
router.use(protect);
router.post(
  '/',
  uploadFields([
    { name: 'heroImages', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
  ]),
  createProject
);
router.patch(
  '/:id',
  uploadFields([
    { name: 'heroImages', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
  ]),
  updateProject
);
router.delete('/:id', deleteProject);
router.delete('/:id/image', deleteProjectImage);
router.get('/:id', getProjectById);

export default router;
