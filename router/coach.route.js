import express from 'express';
import { setProfession, openAI} from '../controller/CoachController.js';
const router = express.Router();

router.post('/set-profession', setProfession);
router.post('/ask-coach', openAI);

export default router;
