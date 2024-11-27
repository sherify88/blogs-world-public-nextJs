import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import MainLayout from '@/layouts/mainLayout';
import PostCard from './postCard';
import { GetPostsResponse, Post } from '@/models/posts';
import { fetchPostServerSide } from '@/services/postServices';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiPlus } from 'react-icons/fi';
interface PostsPageProps {
  items: Post[];
  totalItems: number;
  page: number;
  limit: number;
  pageTitle: string;
  pageDescription: string;
  previewImageUrl?: string;
}

const HomePage: React.FC<PostsPageProps> = ({
  items,
  totalItems,
  page,
  limit,
  pageTitle,
  pageDescription,
  previewImageUrl,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState<'all' | 'myPosts'>('all');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true); // Start loading
      try {
        const query: { [key: string]: string } = { ...router.query, page: '1' };
        if (selectedTab === 'myPosts' && session?.user?.id) {
          query['authorId'] = session.user.id;
        } else {
          delete query['authorId'];
        }
        await router.push({ pathname: router.pathname, query });
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false); // End loading
      }
    };
  
    fetchPosts();
  }, [selectedTab, session]);
  const handleCreatePost = () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    router.push('/posts/create');
  };
  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-12">
          <Skeleton height={30} width={200} className="mb-6" />
          <Skeleton height={20} width="100%" className="mb-4" />
          <Skeleton height={300} width="100%" className="mb-6" />
          <Skeleton height={300} width="100%" className="mb-6" />
          <Skeleton height={300} width="100%" className="mb-6" />
        </div>
      </MainLayout>
    );
  }
  const totalPages = Math.ceil(totalItems / limit);

  const goToPage = (newPage: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  return (
    <MainLayout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {previewImageUrl && <meta property="og:image" content={previewImageUrl} />}
      </Head>

      <div className="max-w-7xl mx-auto py-12">
  
      <div className="flex justify-between items-center mb-6">
  <h2 className="text-3xl font-bold text-gray-800">Explore Posts</h2>
  <button
    onClick={handleCreatePost}
    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:bg-teal-700 transition"
  >
    <FiPlus className="mr-2" /> Share a New Post with Us
  </button>
</div>
 {/* Tabs for Filtering Posts */}
 <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-l-md ${selectedTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700`}
            onClick={() => setSelectedTab('all')}
          >
            All Posts
          </button>
          <button
            className={`px-6 py-2 rounded-r-md ${selectedTab === 'myPosts' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700`}
            onClick={() => setSelectedTab('myPosts')}
            disabled={!session?.user}
          >
            My Posts
          </button>
        </div>
        {/* Posts List */}
        <div className="mt-8">
          {items.length > 0 ? (
            <PostCard items={items} totalItems={totalItems} page={page} limit={limit} />
          ) : (
            <div className="text-center py-10">
              <h3 className="text-2xl font-semibold text-gray-600">No posts available</h3>
              <p className="text-gray-500 mt-2">Be the first to create a post and share your thoughts!</p>
              {session?.user && (
                <Link
                  href="/posts/create"
                  className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Create a Post
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex justify-center items-center gap-6">
          <button
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              page > 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            <FaArrowLeft className="mr-2" />
            Previous
          </button>

          <span className="text-lg font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              page < totalPages ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </MainLayout>
  );
};


export default HomePage;

export const getServerSideProps: GetServerSideProps<PostsPageProps> = async (context) => {
  try {
    const session = await getSession(context);
    const page = parseInt((context.query.page as string) || '1', 10);
    const limit = parseInt((context.query.limit as string) || '10', 10);
    const authorId = context.query.authorId as string;

    const { items, meta } = await fetchPostServerSide(context, page, limit, authorId);

    const firstPost = items[0];
    const pageTitle = `Page ${page} - Posts`;
    const pageDescription = firstPost
      ? firstPost.content.slice(0, 155)
      : 'View the latest posts on this page.';
    const previewImageUrl = firstPost?.imageUrl || null;

    return {
      props: {
        items,
        totalItems: meta.totalItems,
        page: meta.currentPage,
        limit: meta.itemsPerPage,
        pageTitle,
        pageDescription,
        previewImageUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching posts on server:', error);
    return {
      props: {
        items: [],
        totalItems: 0,
        page: 1,
        limit: 10,
        pageTitle: 'Error Loading Posts',
        pageDescription: 'Unable to load posts at this time.',
      },
    };
  }
};
