import express from 'express';
import { setProfession } from '../controller/CoachController.js';
const router = express.Router();

router.post('/set-profession', setProfession);

export default router;
