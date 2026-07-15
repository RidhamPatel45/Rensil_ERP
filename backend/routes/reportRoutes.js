import express from 'express';
import { getFinancials, getEfficiency } from '../controllers/reportController.js';

const router = express.Router();

router.get('/financials', getFinancials);
router.get('/efficiency', getEfficiency);

export default router;
