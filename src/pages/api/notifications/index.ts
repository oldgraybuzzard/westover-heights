import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, return empty array
  // This will be replaced with actual notifications logic later
  res.status(200).json([]);
} 