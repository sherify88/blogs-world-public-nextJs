import { createCommentServerSide, fetchCommentsForPostServerSide } from '@/services/postServices';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export const config = {
    api: {
      bodyParser: false,
    },
  };
// Helper function to parse JSON body when `bodyParser` is disabled
async function parseJsonBody(req: NextApiRequest) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();
    return JSON.parse(data);
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: postId } = req.query;
  const session = await getSession({ req });
  if (!session || !session.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  switch (req.method) {
    case 'GET':
      // Fetch comments for the post
      try {
        const comments = await fetchCommentsForPostServerSide(postId as string);
        return res.status(200).json(comments);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch comments' });
      }

    case 'POST':
        try{
      // Check the content type
      const body = await parseJsonBody(req);
        console.log({body})

        // Handle application/json requests
        const { content, parentCommentId } = body;

        if (!content) {
          return res.status(400).json({ message: 'Content is required' });
        }

       
          const newComment = await createCommentServerSide(
            session.accessToken,
            postId as string,
            content,
            parentCommentId
          );
          return res.status(201).json(newComment);
        } catch (error) {
          console.error('Error creating comment:', error);
          return res.status(500).json({ message: 'Failed to create comment' });
        }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
