import Link from 'next/link';
import MainLayout from '@/layouts/mainLayout';

const ContentModerationPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-12 px-6">
        <h1 className="text-5xl font-bold text-center mb-8">Content Moderation with AI</h1>
        <p className="text-lg text-gray-700 text-center mb-12">
          Our platform leverages cutting-edge AI to ensure all uploaded content meets the highest standards of safety and appropriateness.  
          Protecting our community is our top priority.
        </p>

        {/* Moderation Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">AI-Powered Image Moderation</h3>
            <p className="text-gray-600 mb-4">
              Uploaded images are automatically analyzed using Amazon Rekognition to detect explicit or inappropriate content, such as:
            </p>
            <ul className="list-disc list-inside text-gray-600">
              <li>Explicit nudity</li>
              <li>Violent imagery</li>
              <li>Other harmful content</li>
            </ul>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <p className="text-gray-600 mb-4">
              When you upload an image, our AI scans it in real-time and flags any inappropriate content. Moderated images are automatically blocked, ensuring they never reach our community.
            </p>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold mb-6">Experience Safe and Secure Content Sharing</h2>
          <div className="flex justify-center space-x-4">
            <Link
              href="/posts/create"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create a Post
            </Link>
            <Link
              href="/auth/signin"
              className="px-6 py-3 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContentModerationPage;
