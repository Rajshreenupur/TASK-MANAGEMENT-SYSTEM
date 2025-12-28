import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
}

export const userApi = {
  getAll: async (): Promise<UsersResponse> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  promoteToOwner: async (userId: string): Promise<{ message: string; user: User }> => {
    const response = await apiClient.patch(`/users/${userId}/promote`);
    return response.data;
  },
  demoteToMember: async (userId: string): Promise<{ message: string; user: User }> => {
    const response = await apiClient.patch(`/users/${userId}/demote`);
    return response.data;
  },
};

