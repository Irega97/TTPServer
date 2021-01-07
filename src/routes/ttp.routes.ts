import { Router } from 'express';
import ttpController from '../controllers/ttp.controller';

const router: Router = Router();

router.post('/ttp', ttpController.sendKey);
router.get('/ttp/pubkey', ttpController.sendPubKey);

export default router;