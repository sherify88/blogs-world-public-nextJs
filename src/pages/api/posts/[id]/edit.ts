// src/pages/api/posts/[id]/edit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { IncomingForm } from 'formidable';
import { updatePostServerSide } from '@/services/postServices';

// Disable default body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const session = await getSession({ req });
    if (!session || !session.accessToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = new IncomingForm();

    // Parse the multipart form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: 'Error parsing form data' });
      }

      try {
        const postPic = files.image; // Match the file input name from the frontend form
        const postData = { ...fields };
        const postId = req.query.id as string;

        // Call the service to update the post
        const updatedPost = await updatePostServerSide(session.accessToken, postId, postData, postPic);
        return res.status(200).json(updatedPost);
      } catch (error: any) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: error.message || 'Failed to update post' });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
