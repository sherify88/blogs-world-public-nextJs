// src/pages/users/index.tsx
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import { fetchUsersServerSide } from '@/services/userService';
import { User } from 'next-auth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/layouts/mainLayout';

// Define the props interface
interface UsersPageProps {
  users: User[];
  totalItems: number;
  page: number;
  limit: number;
}

// The main component for displaying users
const UsersPage: React.FC<UsersPageProps> = ({ users, totalItems, page, limit }) => {
  const { data: session, status } = useSession(); // Use session hook to check client-side session status
  const router = useRouter();

  // Handle loading state
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // If no session exists, prompt the user to sign in
  if (!session) {
    return <p>You need to be authenticated to view this page.</p>;
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / limit);

  // Pagination navigation handler
  const goToPage = (pageNumber: number) => {
    router.push(`/users?page=${pageNumber}&limit=${limit}`);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Users</h2>
          {/* Add Create New User Button */}
          <Link href="/users/create">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create New User
            </button>
          </Link>
          <Link href="/users/user_list_2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            UsersPage2
            </button>
          </Link>
        </div>

        <p className="text-lg mb-6">Viewing all users in the system (Page {page} of {totalPages}).</p>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-between items-center">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default UsersPage;

// Fetch users data server-side using cookies for authentication
export const getServerSideProps: GetServerSideProps<UsersPageProps> = async (context) => {
  try {
    // Get the session to check if the user is authenticated
    const session = await getSession(context);

    // If no session is found, redirect to the sign-in page
    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }

    // Extract page and limit from query parameters (default to 1 and 10)
    const page = parseInt((context.query.page as string) || '1', 10);
    const limit = parseInt((context.query.limit as string) || '10', 10);

    // Fetch users from the server-side function that handles pagination
    const { users, totalItems } = await fetchUsersServerSide(context, page, limit); // Adjust this function to accept page and limit

    // Pass users data to the page component as props
    return {
      props: {
        users,
        totalItems,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error fetching users on server:', error);
    return {
      props: {
        users: [],
        totalItems: 0,
        page: 1,
        limit: 10,
      },
    };
  }
};
