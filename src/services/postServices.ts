import { getSession } from 'next-auth/react';
import { getAxiosInstanceWithCookies } from '../utils/axiosInstanceServer';
import { GetServerSidePropsContext } from 'next';
import { Post } from '@/models/posts';
import fs from 'fs';

// Function to fetch Post (Server-side)
export const fetchPostServerSide = async (context: GetServerSidePropsContext, page: number, limit: number,authorId:string) => {
  const session = await getSession(context); // Get session server-side to retrieve access token

  // if (!session || !session.accessToken) {
  //   throw new Error('Unauthorized: No session or access token found');
  // }
  const axiosInstance = getAxiosInstanceWithCookies(context.req.headers, session?.accessToken); // Pass cookies and token

  try {
    const response = await axiosInstance.get('/posts', {
      params: { page, limit,authorId }, // Send pagination parameters to the backend
    });
    return {
      items: response.data.items, // Adjust this to match your backend's response format
      meta: response.data.meta, // Make sure this is the correct field name
    };
  } catch (error) {
    console.error('Error fetching Post (server-side):', error); // Log any errors
    throw error; // Rethrow the error for handling elsewhere
  }
};

/**
 * Function to fetch a post by ID (Server-side)
 * @param id - The ID of the post to fetch
 * @param context - The context for server-side requests (to pass headers and session)
 * @returns The post data for the specified ID
 */
export const fetchPostByIdServerSide = async (context: GetServerSidePropsContext, id: string) => {
  const session = await getSession(context);  // Get session server-side to retrieve access token
  
 
  // Use the Axios instance with cookies and token for authentication

  const axiosInstance = getAxiosInstanceWithCookies(context.req.headers, session?.accessToken);

  try {
    const response = await axiosInstance.get(`/posts/${id}`);
    console.log(response.data)
    return response.data;  // Assuming your API returns post data in response.data
  } catch (error) {
    console.error('Error fetching post by ID (server-side):', error);
    throw error;
  }
};


export const updatePostServerSide = async (accessToken: string, id: string, postData: any, postPic: any) => {
  try {
    const formData = new FormData();

    // Append post data fields
    Object.keys(postData).forEach((key) => {
      const value = (postData as any)[key];
      formData.append(key, value);
    });

    // Append the postPic (file) if available
    if (postPic && postPic[0].filepath) {
      const filePath = postPic[0].filepath;
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: postPic[0].mimetype });

      // Append the file blob with additional metadata
      formData.append('image', blob, postPic[0].originalFilename);
    }

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    const response = await axiosInstance.patch(`/posts/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data', // Manually set multipart headers
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating post (server-side):', error?.response?.data?.message);
    throw error?.response?.data?.message || 'Failed to update post';
  }


}


// Function to create a post (Server-side)
export const createPostServerSide = async (accessToken: string, postData: any, postPic: any) => {
  try {
    const formData = new FormData();

    // Append post data fields
    Object.keys(postData).forEach((key) => {
      formData.append(key, postData[key]);
    });

    // Append the postPic (file) if available
    if (postPic && postPic[0].filepath) {
      const filePath = postPic[0].filepath;
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: postPic[0].mimetype });

      // Append the file blob with additional metadata
      formData.append('image', blob, postPic[0].originalFilename);
    }

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    const response = await axiosInstance.post(`/posts`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data', // Manually set multipart headers
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating post (server-side):', error?.response?.data?.message);
    throw error?.response?.data?.message || 'Failed to create post';
  }
};

// Function to like a post
export const likePostServerSide = async (accessToken: string, postId: string) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    await axiosInstance.post(`/posts/${postId}/like`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Function to unlike a post
export const unlikePostServerSide = async (accessToken: string, postId: string) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    await axiosInstance.post(`/posts/${postId}/unlike`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Function to check if the user has liked the post
export const checkIfLikedServerSide = async (accessToken: string, postId: string) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    const response = await axiosInstance.get(`/posts/${postId}/isLiked`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.isLiked;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// Fetch comments for a post
export const fetchCommentsForPostServerSide = async ( postId: string) => {
  try {
  
 
  const axiosInstance = getAxiosInstanceWithCookies({}, undefined);
    const response = await axiosInstance.get(`/comments?postId=${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Create a new comment
export const createCommentServerSide = async (accessToken: string, postId: string, content: string, parentCommentId?: string) => {
  try {
    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    const response = await axiosInstance.post(`/comments`, { postId, details:content, parentCommentId });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};