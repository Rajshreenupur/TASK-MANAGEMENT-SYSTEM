import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import { userApi, User } from '../api/user';
import { useAuthStore } from '../store/authStore';

export default function UserManagement() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showDemoteDialog, setShowDemoteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      setUsers(response.users);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteClick = (userItem: User) => {
    setSelectedUser(userItem);
    setShowPromoteDialog(true);
  };

  const handleDemoteClick = (userItem: User) => {
    setSelectedUser(userItem);
    setShowDemoteDialog(true);
  };

  const handlePromote = async () => {
    if (!selectedUser) return;

    try {
      await userApi.promoteToOwner(selectedUser.id);
      toast.success('User promoted to OWNER successfully!');
      setShowPromoteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to promote user');
    }
  };

  const handleDemote = async () => {
    if (!selectedUser) return;

    try {
      await userApi.demoteToMember(selectedUser.id);
      toast.success('User demoted to MEMBER successfully!');
      setShowDemoteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to demote user');
    }
  };

  if (user?.role !== 'OWNER') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only OWNERs can access user management.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {userItem.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{userItem.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userItem.role === 'OWNER'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userItem.id === user?.id ? (
                          <span className="text-gray-400">Current User</span>
                        ) : userItem.role === 'OWNER' ? (
                          <button
                            onClick={() => handleDemoteClick(userItem)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Demote to Member
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteClick(userItem)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Promote to Owner
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About User Roles</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>OWNER:</strong> Can create projects, manage users, and has full access
                  </li>
                  <li>
                    <strong>MEMBER:</strong> Can access assigned projects and tasks
                  </li>
                  <li>The first user to register automatically becomes an OWNER</li>
                  <li>At least one OWNER must always exist in the system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPromoteDialog && selectedUser && (
        <ConfirmDialog
          isOpen={showPromoteDialog}
          onClose={() => {
            setShowPromoteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handlePromote}
          title="Promote User to OWNER"
          message={`Are you sure you want to promote ${selectedUser.name} (${selectedUser.email}) to OWNER? They will have full access to create projects and manage users.`}
          confirmText="Promote"
          cancelText="Cancel"
        />
      )}

      {showDemoteDialog && selectedUser && (
        <ConfirmDialog
          isOpen={showDemoteDialog}
          onClose={() => {
            setShowDemoteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDemote}
          title="Demote User to MEMBER"
          message={`Are you sure you want to demote ${selectedUser.name} (${selectedUser.email}) to MEMBER? They will lose the ability to create projects and manage users.`}
          confirmText="Demote"
          cancelText="Cancel"
        />
      )}
    </Layout>
  );
}

