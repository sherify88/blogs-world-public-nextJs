// src/pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { updateUserServerSide } from '@/services/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  const body = req.body;
  delete req.body;
  if (req.method === 'PATCH') {
    const session = await getSession({ req });
    if (!session || !session.accessToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const userData = body; // This will be the updated user data sent from the client

    try {
      const updatedUser = await updateUserServerSide(session.accessToken, id as string, userData);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user (API route):', error);
      return res.status(500).json({ message: 'Failed to update user' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
