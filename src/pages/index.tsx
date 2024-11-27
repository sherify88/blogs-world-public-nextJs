import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import MainLayout from '@/layouts/mainLayout';
import PostCard from './posts/postCard';
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
     {/* Hero Banner */}
<div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-8 shadow-lg mb-12">
  <h1 className="text-5xl font-bold mb-4">Create and Share with AI-Powered Insights</h1>
  <p className="text-lg mb-6">
    Leverage cutting-edge AI to craft engaging posts effortlessly. From creative titles to optimized content, our platform empowers you to make an impact.
  </p>
  <div className="flex space-x-4">
    {session?.user ? (
      <Link
        href="/posts/create"
        className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
      >
        Start Creating with AI
      </Link>
    ) : (
      <Link
        href="/auth/signin"
        className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
      >
        Sign In to Create
      </Link>
    )}
    <Link
      href="/features"
      className="px-6 py-3 border border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
    >
      Learn More
    </Link>
  </div>
  {/* <img
    src="/images/ai-banner-illustration.png"
    alt="AI Powered Content Creation"
    className="absolute right-0 bottom-0 w-1/3 hidden lg:block"
  /> */}
</div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-bold mb-2">AI-Assisted Post Editing</h3>
            <p className="text-gray-600 mb-4">
              Let AI help you craft compelling titles and content with real-time suggestions and customizable prompts.
            </p>
            <Link
      href={session?.user ? "/posts/create" : "/auth/signin"}
      className="text-blue-600 font-bold hover:underline"
    >
      {session?.user ? "Try it Now →" : "Sign In to Try →"}
    </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Content Moderation with AI</h3>
            <p className="text-gray-600 mb-4">
              Ensure safe and appropriate content with automatic image moderation powered by AI.
            </p>
            <Link
              href="/features"
              className="text-blue-600 font-bold hover:underline"
            >
              Learn More →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Real-Time Notifications</h3>
            <p className="text-gray-600 mb-4">
              Stay informed about new posts and trending content with event-driven notifications.
            </p>
            <Link
              href="/features"
              className="text-blue-600 font-bold hover:underline"
            >
              Discover More →
            </Link>
          </div>
        </div>

        {/* Shortlisted Posts List */}
        <div className="mt-8">
  {/* Explore Posts Header */}
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-800">Explore Posts</h2>
    {session?.user ? (
      <button
        onClick={() => router.push('/posts/create')}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:bg-teal-700 transition"
      >
        <FiPlus className="mr-2" /> Share a New Post with Us
      </button>
    ) : (
      <Link
        href="/auth/signin"
        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:bg-teal-700 transition"
      >
        <FiPlus className="mr-2" /> Sign In to Share a Post
      </Link>
    )}
  </div>

  {/* Post Cards or Empty State */}
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

  {/* View All Posts Button */}
  <div className="text-center mt-8">
    <Link
      href="/posts"
      className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-md hover:bg-indigo-700 transition"
    >
      Browse All Posts
    </Link>
  </div>
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
