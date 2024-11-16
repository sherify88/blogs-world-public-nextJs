import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, ChangeEvent, FormEvent } from 'react';
import MainLayout from '@/layouts/mainLayout';
import { Post } from '@/models/posts';
import { fetchPostByIdServerSide } from '@/services/postServices';

interface EditPostProps {
  post: Post | null;
}

const EditPost: React.FC<EditPostProps> = ({ post }) => {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(imageUrl || null);

  // Handle file change and image preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/edit`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setIsSuccess(true);
        setModalMessage('Post updated successfully!');
      } else {
        const errorData = await response.json();
        setIsSuccess(false);
        setModalMessage(errorData.message || 'Failed to update post.');
      }
    } catch (error) {
      console.error('An error occurred while updating the post:', error);
      setIsSuccess(false);
      setModalMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle the OK button in the modal
  const handleModalClose = () => {
    setModalMessage(null);
    if (isSuccess && post) {
      router.push(`/posts/${post.id}/details`);
    }
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

  return (
    <MainLayout>
      {/* Loading Dialog */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-transparent border-4 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
            <p className="text-white mt-4">Saving Changes...</p>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {isSuccess ? 'Success' : 'Error'}
            </h3>
            <p className="mb-6">{modalMessage}</p>
            <button
              onClick={handleModalClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-4xl font-bold mb-6">Edit Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="image">
              Upload Image
            </label>
            <input
              type="file"
              id="image"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {previewImage && (
              <div className="mt-4">
                <p className="text-gray-700">Image Preview:</p>
                <img src={previewImage} alt="Preview" className="max-h-64 rounded-md mt-2" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditPost;

export const getServerSideProps: GetServerSideProps<EditPostProps> = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const post = await fetchPostByIdServerSide(context, id);

    if (!post) {
      return {
        notFound: true,
      };
    }

    return {
      props: { post },
    };
  } catch (error) {
    console.error('Error fetching post for editing:', error);
    return {
      props: { post: null },
    };
  }
};
