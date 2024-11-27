import { FaEdit, FaShieldAlt, FaBell, FaDatabase, FaCloud, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import MainLayout from '@/layouts/mainLayout';
import { useSession } from 'next-auth/react';

const FeaturesPage: React.FC = () => {
    const { data: session, status } = useSession();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-12 px-6">
        <h1 className="text-5xl font-bold text-center mb-12">Platform Features</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <FaEdit className="text-blue-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Assisted Post Editing</h3>
            <p className="text-gray-600 mb-4">
              Let AI help you craft compelling titles and content with real-time suggestions and customizable prompts, enhancing your creativity and engagement.
            </p>
            <Link
      href={session?.user ? "/posts/create" : "/auth/signin"}
      className="text-blue-600 font-bold hover:underline"
    >
      {session?.user ? "Try it Now →" : "Sign In to Try →"}
    </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <FaShieldAlt className="text-green-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Content Moderation with AI</h3>
            <p className="text-gray-600 mb-4">
              Ensure a safe and trustworthy platform with AI-powered image moderation that blocks inappropriate or harmful content.
            </p>
            <Link href="/content-moderation" className="text-green-600 font-bold hover:underline">
  Learn More →
</Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <FaBell className="text-yellow-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Event-Driven Notifications</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with new posts, trending content, and scheduled updates through real-time notifications.
            </p>
            <Link href="/posts/" className="text-yellow-600 font-bold hover:underline">
              Explore Posts →
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <FaDatabase className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Scalable Database</h3>
            <p className="text-gray-600 mb-4">
              Leverage AWS RDS and Sequelize ORM for secure and efficient data management with transactional integrity.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <FaCloud className="text-purple-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Serverless Architecture</h3>
            <p className="text-gray-600 mb-4">
              Built on AWS Lambda and API Gateway, ensuring a scalable, cost-efficient backend for seamless content management.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <FaLock className="text-indigo-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Content Storage</h3>
            <p className="text-gray-600 mb-4">
              Protect your data with AWS S3, strict access policies, and advanced security measures for peace of mind.
            </p>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create and Share?</h2>
          <Link
            href="/posts/create"
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Now
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default FeaturesPage;
