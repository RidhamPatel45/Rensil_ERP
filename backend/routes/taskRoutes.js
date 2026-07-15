import express from 'express';
import { getTasks, getTasksByAssignee, getTaskById, updateTaskStatus } from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTasks);
router.get('/assignee/:name', getTasksByAssignee);
router.get('/:id', getTaskById);
router.put('/:id/status', updateTaskStatus);

export default router;
