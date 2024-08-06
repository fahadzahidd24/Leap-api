import express from 'express';
import { setPAS, getDailyPAS, getWeeklyPAS, getAnnualPAS } from '../controller/PAS.controller.js';

const router = express.Router();

router.post('/pas', setPAS);
router.get('/pas/daily', getDailyPAS);
router.get('/pas/weekly', getWeeklyPAS);
router.get('/pas/annual', getAnnualPAS);

export default router;
