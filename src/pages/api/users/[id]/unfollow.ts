// src/pages/api/users/[id]/unfollow.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { unfollowUserServerSide } from '@/services/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id: bloggerId } = req.query;

  try {
    await unfollowUserServerSide(session.accessToken, bloggerId as string);
    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
}
