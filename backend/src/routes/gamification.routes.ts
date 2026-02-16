import { Router } from 'express';
import { completeSession } from '../controllers/gamification.controller';

const router = Router();

router.post('/complete', completeSession);

export default router;
