import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, return null to indicate no user is logged in
  // This will be replaced with actual authentication logic later
  res.status(200).json(null);
} 