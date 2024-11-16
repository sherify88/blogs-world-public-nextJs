import NextAuth, { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      
      async authorize(credentials) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const user = response.data;
          if (user && user.token) {
            return {
              ...user,
              id: user.id,
              name: user.name,
              role: user.role,
              accessToken: user.token,
            };
          }
          return null;
        } catch (error) {
          console.error('Failed to authorize user:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.email = user.email;
        token.imageUrl = user.imageUrl
      }
      if (account?.provider === 'google' && account.access_token) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            token: account.access_token,
          });

          const backendUser = response.data;
          token.accessToken = backendUser.token;
          token.id = backendUser.id;
          token.name = backendUser.name;
          token.role = backendUser.role;
          token.email = backendUser.email;
          token.imageUrl = backendUser.imageUrl;
        } catch (error) {
          console.error('Error authenticating with backend:', error);
        }
      }

    
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = {
        id: token.id,
        name: token.name,
        role: token.role,
        email: token.email,
        imageUrl: token.imageUrl,
      } as User;
      return session;
    },
    async redirect({ url, baseUrl }) {
    
      // If the URL points to the sign-in page, redirect to the root instead
      if (url.includes('/auth/signin')) {
        return baseUrl;
      }
    
      // Ensure the URL is within the same domain to prevent open redirects
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
};

export default NextAuth(authOptions);
