// src/hooks/useFetchWithAuth.ts
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

/**
 * Fetch data from an API endpoint with authentication using server-side cookies.
 * @param url The API endpoint to fetch data from.
 * @param context The Next.js server-side context.
 * @returns The fetched data or null in case of an error.
 */
export const fetchWithAuth = async (url: string, context: GetServerSidePropsContext) => {
  try {
    const session = await getSession(context);

    if (!session) {
      return null; // Or handle redirection or error based on your requirements
    }

    const response = await fetch(url, {
      headers: {
        cookie: context.req.headers.cookie || '', // Pass cookies from the request
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data with auth:', error);
    return null;
  }
};
