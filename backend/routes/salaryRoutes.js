import express from 'express';
import { getSalaries, getMySalary, updatePayout } from '../controllers/salaryController.js';

const router = express.Router();

router.get('/', getSalaries);
router.get('/my/:userId', getMySalary);
router.put('/payout/:userId', updatePayout);

export default router;
