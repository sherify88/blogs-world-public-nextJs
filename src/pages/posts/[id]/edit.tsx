import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, ChangeEvent, FormEvent } from 'react';
import MainLayout from '@/layouts/mainLayout';
import { Post } from '@/models/posts';
import { fetchPostByIdServerSide } from '@/services/postServices';
import { FaSpinner } from 'react-icons/fa'; // Spinner icon
import { MdAutoFixHigh } from 'react-icons/md'; // Magic wand icon
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
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // AI Suggestion States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiField, setAiField] = useState<'title' | 'content' | null>(null);

  // Handle AI suggestion fetch
  const fetchAiSuggestion = async (field: 'title' | 'content') => {
    setAiLoading(true);
    setAiField(field);

    try {
      const currentText = field === 'title' ? title : content;
      if ((!currentText || currentText.trim() === '') && field === 'content') {
        alert(`Please enter some content to enhance.`);
        setAiLoading(false);
        return;
      }

      const basePrompt =
        field === 'title'
          ? `Suggest a creative title for a blog post about: ${content}`
          : `Optimize and refine the following content for clarity, grammar, and engagement while keeping the intent: "${currentText}"`;

      const prompt = customPrompt
        ? `${basePrompt} Additionally, ${customPrompt}`
        : basePrompt;

      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setAiSuggestion(data.text.trim().replace(/\*\*/g, ''));
    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
    } finally {
      setAiLoading(false);
    }
  };
  const applyAiSuggestion = () => {
    if (aiField && aiSuggestion) {
      if (aiField === 'title') setTitle(aiSuggestion);
      if (aiField === 'content') setContent(aiSuggestion);

      setAiSuggestion(null);
      setAiField(null);
    }
  };

  const clearAiSuggestion = () => {
    setAiSuggestion(null);
    setAiField(null);
  };

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
            <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
            <p className="text-white mt-4">Saving Changes...</p>
          </div>
        </div>
      )}
      <div className="relative">
        <label htmlFor="customPrompt" className="block text-lg font-medium text-gray-700">
          Custom AI Prompt (Optional)
        </label>

      </div>
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
          {/* Custom Prompt Field */}
          <div className="relative">
            <label htmlFor="customPrompt" className="block text-lg font-medium text-gray-700">
              Custom AI Prompt (Optional)
            </label>
            <div className="relative">
              <input
                id="customPrompt"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add custom instructions for AI optimization"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                {aiLoading ? (
                  <FaSpinner className="animate-spin h-5 w-5 text-blue-500" />
                ) : (
                  <MdAutoFixHigh className="h-5 w-5 text-gray-400" />
                )}
              </span>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="title">
              Title
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              <button
                type="button"
                className={`px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center space-x-2 ${aiLoading && aiField === 'title' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => fetchAiSuggestion('title')}
                disabled={aiLoading && aiField === 'title'}
              >
                {aiLoading && aiField === 'title' ? (
                  <FaSpinner className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <MdAutoFixHigh className="h-5 w-5 text-white" />
                )}
                <span>{aiLoading && aiField === 'title' ? 'Loading...' : 'Get AI Title Suggestion'}</span>
              </button>
            </div>
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="content">
              Content
            </label>
            <div className="flex items-center space-x-2">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={6}
                required
              />
             <button
  type="button"
  className={`px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center space-x-2 ${aiLoading && aiField === 'content' ? 'opacity-50 cursor-not-allowed' : ''}`}
  onClick={() => fetchAiSuggestion('content')}
  disabled={aiLoading && aiField === 'content'}
>
  {aiLoading && aiField === 'content' ? (
    <FaSpinner className="animate-spin h-5 w-5 text-white" />
  ) : (
    <MdAutoFixHigh className="h-5 w-5 text-white" />
  )}
  <span>{aiLoading && aiField === 'content' ? 'Loading...' : 'Enhance with AI'}</span>
</button>
            </div>
          </div>

          {/* AI Suggestion Section */}
          {aiSuggestion && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-100">
              <h4 className="font-bold text-lg">AI Suggestion</h4>
              <p className="text-gray-700 mt-2">{aiSuggestion}</p>
              <div className="flex items-center space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                  onClick={applyAiSuggestion}
                >
                  Apply Suggestion
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-500 border rounded hover:bg-gray-100"
                  onClick={clearAiSuggestion}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Image Upload Field */}
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

          {/* Submit Button */}
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
