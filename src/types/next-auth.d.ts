// src/types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    imageUrl?: string;
    orgPrivileges: string[];
    orgName: string;
    orgNameEn: string;
    orgId: string;
    orgImageUrl: string;
    orgType: string;
    depName: string;
    accessToken: string; // Add the access token property
  }

  interface Session {
    user: User; // Reference the custom user type
    accessToken: string; // Add the access token property
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    user: User;
    accessToken: string; // Add accessToken to the JWT token type

  }
}