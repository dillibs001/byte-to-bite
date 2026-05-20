import { Request, Response, NextFunction } from 'express';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Grab the secret key provided by the user in the HTTP headers
  const clientApiKey = req.header('X-Admin-API-Key');
  
  // Grab the real secret key from your secure .env file
  const serverApiKey = process.env.ADMIN_API_KEY;

  if (!serverApiKey) {
    console.error('⚠️ CRITICAL: ADMIN_API_KEY is not set in the .env file!');
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  // If they don't match, bounce them immediately!
  if (!clientApiKey || clientApiKey !== serverApiKey) {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing Admin API Key.' });
  }

  // If the keys match, open the gate and let them through to the controller!
  next();
};