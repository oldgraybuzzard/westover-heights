import React from 'react';
import { GetServerSideProps } from 'next';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import UserManagement from '@/components/admin/users/UserManagement';
import api from '@/lib/api';

interface UsersPageProps {
  initialUsers: any[];
}

const UsersPage: React.FC<UsersPageProps> = ({ initialUsers }) => {
  useProtectedRoute(true);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage and monitor user accounts
        </p>
      </div>

      <UserManagement initialUsers={initialUsers} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // This will be replaced with actual API call
    const initialUsers = [];

    return {
      props: {
        initialUsers,
      },
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return {
      props: {
        initialUsers: [],
      },
    };
  }
};

export default UsersPage; 