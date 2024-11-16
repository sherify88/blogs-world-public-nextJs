import { getSession } from 'next-auth/react';
import axiosInstanceClient from '../utils/axiosInstanceClient';
import { getAxiosInstanceWithCookies } from '../utils/axiosInstanceServer';
import { GetServerSidePropsContext } from 'next';
import { User } from 'next-auth';
import fs from 'fs';

// Function to fetch users (Server-side)
export const fetchUsersServerSide = async (context: GetServerSidePropsContext, page: number, limit: number) => {
  const session = await getSession(context); // Get session server-side to retrieve access token

  if (!session || !session.accessToken) {
    throw new Error('Unauthorized: No session or access token found');
  }

  const axiosInstance = getAxiosInstanceWithCookies(context.req.headers, session.accessToken); // Pass cookies and token

  try {
    const response = await axiosInstance.get('/users', {
      params: { page, limit }, // Send pagination parameters to the backend
    });
    return {
      users: response.data.items, // Adjust this to match your backend's response format
      totalItems: response.data.meta.totalItems, // Make sure this is the correct field name
    };
  } catch (error) {
    console.error('Error fetching users (server-side):', error); // Log any errors
    throw error; // Rethrow the error for handling elsewhere
  }
};

/**
 * Function to fetch a user by ID (Server-side)
 * @param id - The ID of the user to fetch
 * @param context - The context for server-side requests (to pass headers and session)
 * @returns The user data for the specified ID
 */
export const fetchUserByIdServerSide = async (context: GetServerSidePropsContext, id: string) => {
  const session = await getSession(context);  // Get session server-side to retrieve access token
  
  if (!session || !session.accessToken) {
    throw new Error('Unauthorized: No session or access token found');
  }

  // Use the Axios instance with cookies and token for authentication
  const axiosInstance = getAxiosInstanceWithCookies(context.req.headers, session.accessToken);

  try {
    const response = await axiosInstance.get(`/users/${id}`);
    console.log(response.data)
    return response.data;  // Assuming your API returns user data in response.data
  } catch (error) {
    console.error('Error fetching user by ID (server-side):', error);
    throw error;
  }
};


export const updateUserServerSide = async (accessToken: string, id: string, userData: User) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    const response = await axiosInstance.patch(`/users/${id}`, userData,);
    console.log(response.data)
    return response.data;  // Assuming your API returns the updated user data
  } catch (error) {
    console.error('Error updating user (server-side):', error);
    throw error;
  }
};

// Function to create a user (Server-side)
export const createUserServerSide = async (userData: any, userPic: any) => {
  try {
    // Create FormData to send the user data and file
    const formData = new FormData();

    // Append user data fields
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });

    // Append the userPic (file) if available
    if (userPic && userPic[0].filepath) {
      const filePath = userPic[0].filepath;
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: userPic[0].mimetype });

      // Append the file blob with additional metadata
      formData.append('image', blob, userPic[0].originalFilename);
    }
    const axiosInstance = getAxiosInstanceWithCookies({}, '');
    const response = await axiosInstance.post(`/users/blogger/signup`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Send data as multipart form
      },
    });

    return response.data; // Assuming the backend returns the created user data
  } catch (error: any) {
    console.error('Error creating user (server-side):', error?.response?.data?.message);
    throw error?.response?.data?.message || 'Failed to create user';
  }
};
/**
 * Function to follow a user
 */
export const followUserServerSide = async (accessToken: string, bloggerId: string) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    await axiosInstance.post(`/users/${bloggerId}/follow`,{
      headers: {
        Authorization: `Bearer ${accessToken}`, // Include Bearer token in headers
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in followUserServerSide:', error);
    throw error;
  }
};

/**
 * Function to unfollow a user
 */
export const unfollowUserServerSide = async (accessToken: string, bloggerId: string) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    await axiosInstance.post(`/users/${bloggerId}/unfollow`,{
      headers: {
        Authorization: `Bearer ${accessToken}`, // Include Bearer token in headers
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in unfollowUserServerSide:', error);
    throw error;
  }
};

/**
 * Function to follow a user
 */
export const checkIfFollowing = async (accessToken: string, bloggerId: string) => {
  try {

    const axiosInstance = getAxiosInstanceWithCookies({}, accessToken);
    const response = await axiosInstance.get(`/users/${bloggerId}/isFollowing`,{
      headers: {
        Authorization: `Bearer ${accessToken}`, // Include Bearer token in headers
        'Content-Type': 'application/json',
      },
    });
    return response.data.isFollowing;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }

};