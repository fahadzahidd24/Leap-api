import express from 'express';
import { createEntries, getEntries, updateEntries, updateDailyEntries } from '../controller/Entries.controller.js';

const router = express.Router();

router.post('/entries', createEntries);
router.get('/entries', getEntries);
router.put('/entries', updateEntries);
router.put('/entries/daily', updateDailyEntries);

export default router;
