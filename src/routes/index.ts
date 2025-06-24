import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getMe, registerUserOnSupabase } from '../controllers/UserController';

const router = Router();

router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API is running'
    });
});

// User routes
router.get('/me', requireAuth, getMe);
router.post('/register', requireAuth, registerUserOnSupabase);

export default router; 