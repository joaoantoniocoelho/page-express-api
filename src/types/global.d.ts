/// <reference types="@clerk/express/env" />

declare global {
  namespace Express {
    interface Request {
      clerkId?: string;
    }
  }
}