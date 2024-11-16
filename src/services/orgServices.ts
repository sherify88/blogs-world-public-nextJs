// src/services/userService.ts
import axios from 'axios';
import { User } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};

export const fetchUserById = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/users/${id}`);
  return response.data;
};
