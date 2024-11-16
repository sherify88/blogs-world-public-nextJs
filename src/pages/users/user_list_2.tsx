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
const UsersPage2: React.FC<UsersPageProps> = ({ users, totalItems, page, limit }) => {
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

<div className="Table w-full max-w-full overflow-x-auto flex flex-row justify-start items-start">
  <div className="TableColumn w-[343px]">
    <div className="TableCellHeader h-12 pt-5 bg-neutral-50">
      <div className="Title text-black text-xs font-semibold">Title</div>
      <div className="Border w-full h-0.5 bg-[#dfe1e6]" />
    </div>
    <div className="TableCells h-10 py-2.5 flex items-center">
      <div className="Text text-black text-sm">Text</div>
    </div>
  </div>

  <div className="TableColumnUser w-[250px]">
    <div className="TableCellHeader h-12 pt-5 bg-neutral-50">
      <div className="Title text-black text-xs font-semibold">User</div>
      <div className="Border w-full h-0.5 bg-[#dfe1e6]" />
    </div>
    <div className="TableCells h-10 py-2.5 flex items-center gap-2">
      <div className="Avatar w-6 h-6 bg-[#d9d9d9] rounded-full" />
      <img className="Image4 w-6 h-[30px]" src="https://via.placeholder.com/24x30" />
      <div className="Text text-[#2f65dd] text-sm">Sarah Eastern</div>
    </div>
  </div>

  <div className="TableColumnStatus w-[200px]">
    <div className="TableCellHeader h-12 pt-5 bg-neutral-50">
      <div className="Title text-black text-xs font-semibold">Status</div>
      <div className="Border w-full h-0.5 bg-[#dfe1e6]" />
    </div>
    <div className="TableCells h-10 py-2.5 flex items-center">
      <div className="Frame524 px-2 py-0.5 bg-[#ebffed] rounded-sm flex items-center">
        <div className="Label text-[#00b111] text-[11px] font-bold uppercase">LABEL</div>
      </div>
    </div>
  </div>

  <div className="TableColumnDate w-[200px]">
    <div className="TableCellHeader h-12 pt-5 bg-neutral-50">
      <div className="Title text-black text-xs font-semibold">Date</div>
      <div className="Border w-full h-0.5 bg-[#dfe1e6]" />
    </div>
    <div className="TableCells h-10 py-2.5 flex items-center">
      <div className="0917 text-blue-500 text-sm">2023/09/17</div>
    </div>
  </div>
</div>
  {/* Pagination Controls */}
  <div className="mt-6 flex flex-col justify-between items-center">
          <button
            className="px-4 py-2 bg-blue-500 rounded-md hover:bg-gray-400"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="px-4 py-2 bg-blue-500  rounded-md "
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
</MainLayout>

  );
};

export default UsersPage2;

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
