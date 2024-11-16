import axios from 'axios';

export const getAxiosInstanceWithCookies = (reqHeaders: { cookie?: string }, token?: string) => {
  // Create a new Axios instance for each request to avoid header reuse
  const axiosInstanceServer = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  axiosInstanceServer.interceptors.request.use(
    (config) => {
      // Explicitly clear any existing headers
      config.headers = new axios.AxiosHeaders();

      // Attach cookies from the request headers if available
      if (reqHeaders.cookie) {
        config.headers.Cookie = reqHeaders.cookie;
      }

      // Attach the Bearer token if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }


      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstanceServer;
};
