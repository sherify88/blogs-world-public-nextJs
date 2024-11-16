// src/pages/api/users/[id]/follow.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { checkIfFollowing, followUserServerSide } from '@/services/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id: bloggerId } = req.query;

  try {
    const isFollowing =  await checkIfFollowing(session.accessToken, bloggerId as string);
    return res.status(200).json({ isFollowing });
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({ message: 'Internal server error' });

  }
}
