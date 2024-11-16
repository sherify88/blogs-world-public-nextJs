import { GetServerSideProps } from 'next';
import { getCsrfToken, getSession, signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface SignInForm {
  email: string;
  password: string;
}

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const { register, handleSubmit } = useForm<SignInForm>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle sign-in with credentials
  const onSubmit = async (data: SignInForm) => {
    setLoading(true);
    const response = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: '/',
    });

    setLoading(false);

    if (response?.error) {
      setErrorMessage('Invalid credentials. Please try again.');
    } else {
      window.location.href = response?.url || '/';
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const response = await signIn('google', { redirect: false });

    if (response?.ok) {
      const session = await getSession();
      if (session?.accessToken) {
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            token: session.accessToken,
          });
          window.location.href = '/';
        } catch (error) {
          console.error('Error posting to backend:', error);
          setErrorMessage('Google sign-in failed. Please try again.');
        }
      }
    } else {
      setErrorMessage('Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-transparent border-4 border-white rounded-full w-12 h-12 animate-spin"></div>
            <p className="text-white mt-4">Signing In...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>

        {/* Sign-In Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { required: true })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: true })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-md hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="text-center my-4 text-gray-500">OR</div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-white text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition duration-200"
        >
          <span className="flex items-center justify-center gap-2">
            <img src="/icons/google.png" alt="Google" className="w-6.3 h-6" />
            Continue with Google
          </span>
        </button>

        {/* Sign Up Prompt */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-700">
            Don’t have an account?{' '}
            <Link href="/auth/signup" className="text-teal-600 hover:underline">
              Sign up here
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
};
