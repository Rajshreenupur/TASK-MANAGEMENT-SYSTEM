import apiClient from './client';

export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
  projectId: string | {
    _id: string;
    name: string;
  };
  priority: TaskPriority;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assignee?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee?: string;
  priority?: TaskPriority;
}

export interface ActivityLog {
  _id: string;
  taskId: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  previousValue?: string;
  newValue?: string;
  createdAt: string;
}

export const taskApi = {
  create: async (data: CreateTaskData): Promise<{ task: Task }> => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },
  getByProject: async (
    projectId: string,
    page = 1,
    limit = 20,
    status?: TaskStatus
  ): Promise<{ tasks: Task[]; pagination: any }> => {
    const response = await apiClient.get(`/tasks/project/${projectId}`, {
      params: { page, limit, status },
    });
    return response.data;
  },
  getById: async (taskId: string): Promise<{ task: Task }> => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },
  update: async (taskId: string, data: UpdateTaskData): Promise<{ task: Task }> => {
    const response = await apiClient.patch(`/tasks/${taskId}`, data);
    return response.data;
  },
  updateStatus: async (taskId: string, status: TaskStatus): Promise<{ task: Task }> => {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
  getActivityLogs: async (taskId: string, page = 1, limit = 20): Promise<{ logs: ActivityLog[]; pagination: any }> => {
    const response = await apiClient.get(`/tasks/${taskId}/activity`, {
      params: { page, limit },
    });
    return response.data;
  },
  delete: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};

