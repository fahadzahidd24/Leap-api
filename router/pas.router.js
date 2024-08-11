import express from 'express';
import { setPAS, getDailyPAS, getWeeklyPAS, getAnnualPAS, editDailyPAS } from '../controller/PAS.controller.js';

const router = express.Router();

router.post('/pas', setPAS);
router.post('/pas/edit', editDailyPAS);
router.get('/pas/daily', getDailyPAS);
router.get('/pas/weekly', getWeeklyPAS);
router.get('/pas/annual', getAnnualPAS);

export default router;
