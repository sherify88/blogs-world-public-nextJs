import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import MainLayout from '@/layouts/mainLayout';
import axios from 'axios';

// Define the User interface
interface User {
  firstNameAr: string;
  lastNameAr?: string;
  phone: string;
  gender: string;
  orgId: string;
  role: string;
  email?: string;
  photo?: FileList; // Add photo as a File type for the upload
}

const CreateUserPage: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<User>(); // Use the useForm hook for form handling
  const router = useRouter();

  // Submit handler for creating a new user
  const onSubmit = async (data: User) => {
    try {
      // Create a FormData object to handle the file and user data
      const formData = new FormData();
      
      // Append all form fields to FormData
      formData.append('firstNameAr', data.firstNameAr);
      formData.append('lastNameAr', data.lastNameAr || '');
      formData.append('phone', data.phone);
      formData.append('gender', data.gender);
      formData.append('orgId', data.orgId);
      formData.append('role', data.role);
      formData.append('email', data.email || '');

      // Append the photo file (userPic) if it exists
      if (data.photo) {
        formData.append('createUser', data.photo[0]); // 'createUser' should match the field in your NestJS controller
      }

      // Send the request to the API route
      const response = await axios.post('/api/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        alert('User created successfully!');
        router.push('/users'); // Redirect to the user list page
      } else {
        console.error('Failed to create user:', response?.data);
        alert('Failed to create user.');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error?.response?.data?.message || 'Failed to create user.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h2 className="text-2xl font-bold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstNameAr', { required: true })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <input
              id="gender"
              type="text"
              {...register('gender')}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              {...register('phone', { required: true })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="orgId" className="block text-sm font-medium text-gray-700">
              Org ID
            </label>
            <input
              id="orgId"
              type="text"
              {...register('orgId', { required: true })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              id="role"
              type="text"
              {...register('role', { required: true })}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* File input for the photo */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Photo (Optional)
            </label>
            <input
              id="photo"
              type="file"
              {...register('photo')}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create User
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateUserPage;
