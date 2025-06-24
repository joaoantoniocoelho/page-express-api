import { Router } from 'express';
import { requireAuth, verifyClerkWebhook } from '../middleware/requireAuth';
import { getMe, clerkWebhook } from '../controllers/UserController';
import express from 'express';

const router = Router();

router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API is running'
    });
});

// User routes
router.get('/me', requireAuth, getMe);

// Webhook routes
router.post('/webhooks/clerk', express.raw({ type: 'application/json' }), verifyClerkWebhook, clerkWebhook);


export default router; 