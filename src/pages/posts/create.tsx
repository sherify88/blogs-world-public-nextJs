import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import MainLayout from '@/layouts/mainLayout';
import axios from 'axios';
import { useState } from 'react';
import { BiBulb } from 'react-icons/bi'; // Lightbulb icon
import { FaSpinner } from 'react-icons/fa'; // Spinner icon
import { MdAutoFixHigh } from 'react-icons/md'; // Magic wand icon

interface CreatePost {
  title: string;
  content: string;
  photo?: FileList;
}

const CreatePostPage: React.FC = () => {
  const { register, handleSubmit, reset, setValue, getValues, watch } = useForm<CreatePost>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiField, setAiField] = useState<'title' | 'content' | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const fetchAiSuggestion = async (type: 'title' | 'content') => {
    setAiLoading(true);
    setAiField(type); // Track the current field being updated
    try {
      const currentText = getValues(type); // Get the current text for the field
      if ((!currentText || currentText.trim() === '') && type === 'content') {
        alert(`Please enter some content} to enhance.`);
        setAiLoading(false);
        return;
      }
  
      const defaultPrompt =
        type === 'title'
          ? `Suggest a creative title for a blog post about: ${getValues('content')}`
          : `Optimize and refine the following content for clarity, grammar, and engagement while keeping the intent: "${currentText}"`;
  
      const prompt = customPrompt
        ? `${defaultPrompt} Additionally, ${customPrompt}`
        : defaultPrompt;
  
      const response = await axios.post('/api/ai-suggestions', { prompt });
      const suggestion = response.data.text.trim().replace(/\*\*/g, ''); // Remove undesired formatting
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
    } finally {
      setAiLoading(false);
    }
  };
  if (customPrompt.length > 100) {
    alert('Custom prompt must be 100 characters or less.');
    setAiLoading(false);
    return;
  }
  const applyAiSuggestion = () => {
    if (aiField && aiSuggestion) {
      setValue(aiField, aiSuggestion);
      setAiSuggestion(null);
      setAiField(null);
    }
  };

  const clearAiSuggestion = () => {
    setAiSuggestion(null);
    setAiField(null);
  };

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

  const handleModalClose = () => {
    setModalMessage(null);
    if (isSuccess) {
      router.push('/posts/'); // Redirect to homepage if successful
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
              <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
              <div className="absolute text-white text-sm mt-4">
                Fetching AI Suggestions...
              </div>
            </div>
          </div>
        )}
   
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
      placeholder="Add a custom prompt to refine AI suggestions"
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
            <div className="flex items-center space-x-2">
              <input
                id="title"
                type="text"
                {...register('title', { required: true })}
                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the title of your post"
              />
              <button
                type="button"
                className={`px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center space-x-2 ${aiLoading && aiField === 'title' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                onClick={() => fetchAiSuggestion('title')}
                disabled={aiLoading && aiField === 'title'}
              >
                {aiLoading && aiField === 'title' ? (
                  <FaSpinner className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <BiBulb className="h-5 w-5 text-white" />
                )}
                <span>{aiLoading && aiField === 'title' ? 'Loading...' : 'Get AI Title Suggestion'}</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-700">
              Content
            </label>
            <div className="flex items-center space-x-2">
              <textarea
                id="content"
                {...register('content', { required: true })}
                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                placeholder="Write your content here..."
              />
              <button
                type="button"
                className={`px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center space-x-2 ${aiLoading && aiField === 'content' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                onClick={() => fetchAiSuggestion('content')}
                disabled={aiLoading && aiField === 'content'}
              >
                {aiLoading && aiField === 'content' ? (
                  <FaSpinner className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <BiBulb className="h-5 w-5 text-white" />
                )}
                <span>{aiLoading && aiField === 'content' ? 'Loading...' : 'Enhance with AI'}</span>
              </button>
            </div>
          </div>

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
