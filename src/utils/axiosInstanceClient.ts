// src/utils/axiosInstanceClient.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const axiosInstanceClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Base URL for your API
});

// Interceptor to add the access token to the headers for client-side requests
axiosInstanceClient.interceptors.request.use(
  async (config) => {
    const session = await getSession(); // Get the current client-side session

    if (session?.accessToken) {
      // Add the access token to the Authorization header
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error); // Reject the promise if there's an error
  }
);

export default axiosInstanceClient;
