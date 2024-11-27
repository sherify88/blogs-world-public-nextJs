import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Post } from '@/models/posts';
import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FiPlus, FiHeart, FiUserCheck, FiUserPlus, FiLoader } from 'react-icons/fi';
import Image from 'next/image';

interface PostsPageProps {
  items: Post[];
  totalItems: number;
  page: number;
  limit: number;
}

const PostCard: React.FC<PostsPageProps> = ({ items }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});
  const [isFetched, setIsFetched] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // Function to check if the current user is already following the post creator
  const checkIfFollowing = async (userId: string) => {
    try {
      const response = await axios.get(`/api/users/${userId}/isFollowing`);
      return response.data.isFollowing;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  // Function to handle follow/unfollow with loading dialog
  const handleFollowToggle = async (userId: string) => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      if (following[userId]) {
        await axios.post(`/api/users/${userId}/unfollow`);
        setFollowing((prev) => ({ ...prev, [userId]: false }));
      } else {
        await axios.post(`/api/users/${userId}/follow`);
        setFollowing((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items) {
      const fetchFollowingStatus = async () => {
        const statusMap: { [key: string]: boolean } = {};
        const fetchedMap: { [key: string]: boolean } = {};
        for (const item of items) {
          const isFollowing = await checkIfFollowing(item.user.id);
          statusMap[item.user.id] = isFollowing;
          fetchedMap[item.user.id] = true;
        }
        setFollowing(statusMap);
        setIsFetched(fetchedMap);
      };
      fetchFollowingStatus();
    }
  }, [items, session]);

  const handlePostClick = (id: string) => {
    router.push(`/posts/${id}/details`);
  };



  return (
    <div className="max-w-7xl mx-auto py-8">
    


      <ul className="space-y-6">
        {items?.map((item) => (
          <li
            key={item.id}
            className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition cursor-pointer"
            onClick={() => handlePostClick(item.id)}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <img
                src={item?.user?.imageUrl || '/icons/user-avatar.png'}
                alt="User Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-500">
                By {item.user.firstName} {item.user.lastName} &bull;{' '}
                {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              </div>
              {session?.user?.id !== item.user.id && isFetched[item.user.id] && (
              <button
                className={`flex items-center px-4 py-2 rounded-md ${
                following[item.user.id]
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle(item.user.id);
                }}
              >
                {following[item.user.id] ? (
                <>
                  <FiUserCheck className="mr-2" /> Unfollow
                </>
                ) : (
                <>
                  <FiUserPlus className="mr-2" /> Follow
                </>
                )}
              </button>
              )}
            </div>
            {/* Display Post Image */}
            {item.imageUrl && (
              <div className="mb-4 relative w-full h-64">
                <Image
                  src={item.imageUrl}
                  alt="Post Image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  quality={80}
                />
              </div>
            )}

            <p className="text-gray-700 mb-4">{item.content.slice(0, 150)}...</p>
            <div className="text-blue-600 hover:underline">Read More &rarr;</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostCard;
