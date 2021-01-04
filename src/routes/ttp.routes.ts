import { Router } from 'express';
import ttpController from '../controllers/ttp.controller';

const router: Router = Router();

router.post('/ttp', ttpController.sendKey);

export default router;