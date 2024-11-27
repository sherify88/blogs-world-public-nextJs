import { FC, ReactNode, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to handle sign-out and clear local storage/session storage
  const handleSignOut = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Brand */}
            <Link href="/" className="text-2xl font-extrabold text-indigo-700 hover:text-indigo-800 transition-colors">
              Awesome Posts
            </Link>

            {/* Navigation and User Actions */}
            <div className="flex items-center space-x-6">
              {/* Conditional rendering based on user session */}
              {session ? (
                <div className="relative">
                  {/* User Avatar and Dropdown */}
                  <button
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={toggleDropdown}
                  >
                    {session.user?.imageUrl ? (
                      <Image
                        src={session.user.imageUrl}
                        alt={session.user.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <Image
                        src="/icons/user-avatar.png"
                        alt="Default Avatar"
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-gray-800 font-medium">
                      {session.user?.name || session.user?.email}
                    </span>
                  </button>

                  {/* Dropdown Menu for Logged-in Users */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2">
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Join us
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Awesome Posts. All rights reserved.</p>
          <p className="mt-2">
            Built by{' '}
            <a
              href="https://www.linkedin.com/in/sherif-yousry/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline"
            >
              Sherif Yousry
            </a>
          </p>
          {/* <p>
            <Link href="/portfolio" className="text-teal-400 hover:underline">
              View My Portfolio
            </Link>
          </p> */}
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
