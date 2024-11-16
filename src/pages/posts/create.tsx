import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import MainLayout from '@/layouts/mainLayout';
import axios from 'axios';
import { useState } from 'react';

interface CreatePost {
  title: string;
  content: string;
  photo?: FileList;
}

const CreatePostPage: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<CreatePost>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // Function to handle form submission
  const onSubmit = async (data: CreatePost) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      if (data.photo) {
        formData.append('image', data.photo[0]);
      }

      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setModalMessage('Post created successfully!');
        reset();
        setPreviewImage(null);
      } else {
        setIsSuccess(false);
        setModalMessage('Failed to create post.');
      }
    } catch (error: any) {
      setIsSuccess(false);
      setModalMessage(error?.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the OK button in the modal
  const handleModalClose = () => {
    setModalMessage(null);
    if (isSuccess) {
      router.push('/'); // Redirect to homepage if successful
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h2 className="text-3xl font-bold mb-6">Create a New Post</h2>

        {/* Loading Dialog */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-transparent border-4 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
              <p className="text-white mt-4">Creating Post...</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: true })}
              className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the title of your post"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              {...register('content', { required: true })}
              className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="Write your content here..."
            />
          </div>

          {/* File input for the photo with preview */}
          <div>
            <label htmlFor="photo" className="block text-lg font-medium text-gray-700">
              Photo (Optional)
            </label>
            <input
              id="photo"
              type="file"
              {...register('photo')}
              className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              onChange={handleImageChange}
            />
            {previewImage && (
              <div className="mt-4">
                <p className="text-gray-700">Image Preview:</p>
                <img src={previewImage} alt="Preview" className="max-h-64 rounded-lg mt-2" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Post
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreatePostPage;
