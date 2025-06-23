import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';

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
