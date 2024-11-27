import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MainLayout from '@/layouts/mainLayout';
import { Post, Comment } from '@/models/posts';
import { fetchPostByIdServerSide } from '@/services/postServices';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { parseLinks } from '@/utils/parseLinks';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface PostDetailsProps {
  post: Post | null;
}

const PostDetails: React.FC<PostDetailsProps> = ({ post }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likesCount || 0);
  const [loading, setLoading] = useState(false);
  const [isFetchingLikeStatus, setIsFetchingLikeStatus] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loadingComment, setLoadingComment] = useState(false);

  const isPostCreator = session?.user?.id === post?.userId;

  // Fetch comments for the post
  const fetchComments = async () => {
    try {
      setIsFetching(true); // Start loading
      const response = await axios.get(`/api/posts/${post?.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsFetching(false); // End loading
    }
  };


  
  // Add a new comment or reply
  const handleAddComment = async (parentCommentId: string | null = null) => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    const content = parentCommentId ? replyText : commentText;
    if (!content.trim()) return;

    setLoadingComment(true);
    try {
      await axios.post(`/api/posts/${post?.id}/comments`, { content, parentCommentId });
      if (parentCommentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setCommentText('');
      }
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  // Like/Unlike post
  const handleLikeToggle = async () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        await axios.post(`/api/posts/${post?.id}/unlike`);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await axios.post(`/api/posts/${post?.id}/like`);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if the post is liked by the user
  const checkIfLiked = async () => {
    try {
      const response = await axios.get(`/api/posts/${post?.id}/isLiked`);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    } finally {
      setIsFetchingLikeStatus(false);
    }
  };

  useEffect(() => {
    if (post) {
      checkIfLiked();
      fetchComments();
    }
  }, [post, session]);

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleEditPost = () => {
    router.push(`/posts/${post?.id}/edit`);
  };

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-10">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }
  
  // Show skeleton only for client-side hydration
  if (isFetching && typeof window !== 'undefined') {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-10">
          <Skeleton width={100} height={20} />
          <Skeleton circle width={50} height={50} className="mt-4" />
          <Skeleton width="80%" height={30} className="mt-4" />
          <Skeleton width="100%" height={200} className="mt-4" />
          <Skeleton width="60%" height={20} className="mt-4" />
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
<Head>
  {post ? (
    <>
      {/* Page Title */}
      <title>{post.title}</title>
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.content.slice(0, 155)} />
      <meta property="og:image" content={post.imageUrl || 'https://www.awesome-posts.com/default-image.png'} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://www.awesome-posts.com/posts/${post.id}/details`} />
      <meta property="og:site_name" content="Awesome Posts" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.content.slice(0, 155)} />
      <meta name="twitter:image" content={post.imageUrl || 'https://www.awesome-posts.com/default-image.png'} />
    </>
  ) : (
    <title>Post Not Found</title>
  )}
</Head>
      <div className="max-w-4xl mx-auto py-10">
        {/* Creator Info */}
        <div className="flex items-center mb-8">
          {post.user.imageUrl && (
            <Image
              src={post.user.imageUrl}
              alt={post.user.firstName}
              width={50}
              height={50}
              className="rounded-full mr-4"
            />
          )}
          <div>
            <p className="text-lg font-semibold">{post.user.firstName} {post.user.lastName}</p>
            <p className="text-gray-500 text-sm">Published on {new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Edit Button */}
        {isPostCreator && (
          <button onClick={handleEditPost} className="mb-8 px-4 py-2 bg-blue-600 text-white rounded">
            Edit Post
          </button>
        )}

        {/* Post Title */}
        <h1 className="text-2xl font-bold mb-6">{post.title}</h1>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-8">
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* Post Content */}
         <div className="mb-8">
          <p className="whitespace-pre-wrap">{parseLinks(post.content)}</p>
        </div>

        {/* Like Button */}
        <button onClick={handleLikeToggle} className={`px-4 py-2 ${isLiked ? 'bg-red-500' : 'bg-green-500'} text-white rounded`}>
          {isLiked ? 'Unlike' : 'Like'} ({likeCount})
        </button>

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold">Comments</h3>
          {comments.map((comment) => (
            <div key={comment.id} className="mb-6">
              <p>
                <strong>{comment.user.firstName} {comment.user.lastName}</strong> 
                <span className="text-gray-500 text-sm ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
              </p>
              <p>{comment.details}</p>

              {/* Reply Button */}
              <button onClick={() => handleReply(comment.id)} className="text-blue-500 text-sm">Reply</button>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border rounded mt-2"
                  />
                  <button onClick={() => handleAddComment(comment.id)} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">
                    Add Reply
                  </button>
                </div>
              )}

              {/* Sub-comments */}
              {comment.subComments?.map((subComment) => (
                <div key={subComment.id} className="ml-4 mt-4 border-l pl-4 border-gray-300">
                  <p>
                    <strong>{subComment.user.firstName} {subComment.user.lastName}</strong>
                    <span className="text-gray-500 text-sm ml-2">{new Date(subComment.createdAt).toLocaleString()}</span>
                  </p>
                  <p>{subComment.details}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Add New Comment */}
          <div className="mt-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border rounded"
            />
            <button onClick={() => handleAddComment()} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetails;

export const getServerSideProps: GetServerSideProps<PostDetailsProps> = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const post = await fetchPostByIdServerSide(context, id);
    if (!post) {
      return { notFound: true };
    }
    return { props: { post } };
  } catch (error) {
    console.error('Error fetching post details:', error);
    return { props: { post: null } };
  }
};
