import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { taskApi, Task, TaskStatus, TaskPriority } from '../api/task';
import { projectApi } from '../api/project';
import CreateTaskModal from '../components/CreateTaskModal';

const STATUS_COLUMNS: TaskStatus[] = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  BACKLOG: ['IN_PROGRESS'],
  IN_PROGRESS: ['REVIEW'],
  REVIEW: ['DONE'],
  DONE: [],
};

const getValidTransitions = (currentStatus: TaskStatus): TaskStatus[] => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};

export default function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [projectName, setProjectName] = useState('');

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await taskApi.getByProject(projectId);
      setTasks(response.tasks);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const response = await projectApi.getById(projectId);
      setProjectName(response.project.name);
    } catch (err: any) {
      console.error('Failed to load project');
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) => {
    if (!projectId) return;
    try {
      await taskApi.create({
        title: data.title,
        description: data.description,
        projectId,
        priority: data.priority,
      });
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('MEDIUM');
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );

      await taskApi.updateStatus(taskId, newStatus);
      toast.success('Task status updated!');
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update task status');
      fetchTasks();
    }
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading board...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <Link
            to={`/projects/${projectId}`}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Project
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {projectName} - Kanban Board
            </h1>
            <div className="flex space-x-2">
              <Link
                to={`/projects/${projectId}/tasks`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                List View
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Task
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((status) => {
            const columnTasks = getTasksByStatus(status);
            return (
              <div key={status} className="bg-gray-100 rounded-lg p-4">
                <h2 className="font-semibold text-gray-700 mb-4">
                  {STATUS_LABELS[status]} ({columnTasks.length})
                </h2>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${PRIORITY_COLORS[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      {task.assignee && (
                        <p className="text-xs text-gray-500 mb-2">
                          Assigned to: {task.assignee.name}
                        </p>
                      )}
                      <div className="flex space-x-2 mt-3">
                        {getValidTransitions(status).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => handleStatusChange(task._id, nextStatus)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            → {STATUS_LABELS[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          taskTitle={taskTitle}
          setTaskTitle={setTaskTitle}
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          taskPriority={taskPriority}
          setTaskPriority={setTaskPriority}
        />
      </div>
    </Layout>
  );
}

