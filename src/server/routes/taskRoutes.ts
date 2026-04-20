import { Router } from 'express';
import { TaskController } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all task routes
router.use(authMiddleware as any);

router.get('/', TaskController.getTasks as any);
router.post('/', TaskController.createTask as any);
router.patch('/:id', TaskController.updateTask as any);
router.delete('/:id', TaskController.deleteTask as any);

export default router;