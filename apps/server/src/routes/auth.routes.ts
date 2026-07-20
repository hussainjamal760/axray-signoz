import { Router } from 'express';
import { login, callback, me, logout } from '../controllers/auth.controller';

const router = Router();

router.get('/github', login);
router.get('/github/callback', callback);
router.get('/me', me);
router.post('/logout', logout);

export const authRouter = router;
