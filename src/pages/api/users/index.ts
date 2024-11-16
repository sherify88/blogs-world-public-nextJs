import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { createUserServerSide } from '@/services/userService'; 
import {IncomingForm} from "formidable";

// Disable default body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false, // This is required for file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // const session = await getSession({ req });
    // if (!session || !session.accessToken) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    const form = new IncomingForm();

    // Parse the multipart form data (including file uploads)
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: 'Error parsing form data' });
      }

      try {
        // Extract the file and other fields
        const userPic = files.image; // This should match your file input name
        const userData = { ...fields };

        // Call the service to create a user
        const newUser = await createUserServerSide( userData, userPic);
        return res.status(201).json(newUser);
      } catch (error: any) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: error.message || 'Failed to create user' });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
