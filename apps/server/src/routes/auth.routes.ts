import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.get('/github', authController.login);
router.get('/github/callback', authController.callback);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

export default router;
