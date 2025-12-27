import apiClient from './client';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface InviteMemberData {
  email: string;
}

export const projectApi = {
  create: async (data: CreateProjectData): Promise<{ project: Project }> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },
  getAll: async (page = 1, limit = 10): Promise<{ projects: Project[]; pagination: any }> => {
    const response = await apiClient.get('/projects', { params: { page, limit } });
    return response.data;
  },
  getById: async (projectId: string): Promise<{ project: Project }> => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },
  inviteMember: async (projectId: string, data: InviteMemberData): Promise<{ project: Project }> => {
    const response = await apiClient.post(`/projects/${projectId}/invite`, data);
    return response.data;
  },
  removeMember: async (projectId: string, memberId: string): Promise<{ project: Project }> => {
    const response = await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  },
};

