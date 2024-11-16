import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { unlikePostServerSide } from '@/services/postServices';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  try {
    await unlikePostServerSide(session.accessToken, id as string);
    return res.status(200).json({ message: 'Post unliked' });
  } catch (error) {
    console.error('Error unliking post:', error);
    return res.status(500).json({ message: 'Failed to unlike post' });
  }
}
