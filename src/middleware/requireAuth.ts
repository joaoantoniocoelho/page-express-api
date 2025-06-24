import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { Webhook } from 'svix';


export interface AuthenticatedRequest extends Request {
  clerkId?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token not found' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { userId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    req.clerkId = userId as string;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}

export const verifyClerkWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
        res.status(500).json({ error: 'Webhook secret not set' });
        return;
    }

    const payload = JSON.stringify(req.body);
    const headers = {
        'svix-id': req.headers['svix-id'] as string,
        'svix-timestamp': req.headers['svix-timestamp'] as string,
        'svix-signature': req.headers['svix-signature'] as string,
    };

    const svix = new Webhook(WEBHOOK_SECRET);

    try {
        req.body = svix.verify(payload, headers);
        next();
    } catch (err) {
        console.error('Webhook signature invalid:', err);
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
    }
};
