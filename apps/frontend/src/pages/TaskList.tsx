import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { taskApi, Task, TaskStatus, TaskPriority } from '../api/task';
import { projectApi } from '../api/project';
import TaskDetailSheet from '../components/TaskDetailSheet';
import CreateTaskModal from '../components/CreateTaskModal';

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  BACKLOG: 'bg-gray-100 text-gray-800 border-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
  REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  DONE: 'bg-green-100 text-green-800 border-green-300',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'bg-green-50 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
};

const PRIORITY_ICONS: Record<TaskPriority, string> = {
  LOW: '↓',
  MEDIUM: '→',
  HIGH: '↑',
};

export default function TaskList() {
  const { projectId } = useParams<{ projectId: string }>();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');

  const fetchAllTasks = async () => {
    if (!projectId) return;
    try {
      const response = await taskApi.getByProject(projectId, 1, 100);
      setAllTasks(response.tasks);
    } catch (err: any) {
      console.error('Failed to load all tasks for counts');
    }
  };

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await taskApi.getByProject(
        projectId,
        1,
        100,
        statusFilter !== 'ALL' ? statusFilter : undefined
      );
      if (statusFilter === 'ALL') {
        setAllTasks(response.tasks);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const tasks = statusFilter === 'ALL' 
    ? allTasks 
    : allTasks.filter((task) => task.status === statusFilter);

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
    fetchAllTasks();
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      toast.success('Task status updated!');
      setAllTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      fetchAllTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update task status');
      fetchAllTasks();
    }
  };

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
      fetchAllTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedTask(null);
    fetchAllTasks(); 
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    const transitions: Record<TaskStatus, TaskStatus | null> = {
      BACKLOG: 'IN_PROGRESS',
      IN_PROGRESS: 'REVIEW',
      REVIEW: 'DONE',
      DONE: null,
    };
    return transitions[currentStatus] || null;
  };

  const getStatusCount = (status: TaskStatus | 'ALL') => {
    if (status === 'ALL') return allTasks.length;
    return allTasks.filter((task) => task.status === status).length;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Project
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {projectName} - Tasks
              </h1>
              <p className="text-gray-600 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/projects/${projectId}/board`}
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
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                Kanban View
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

        {/* Status Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter by status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getStatusCount('ALL')})
            </button>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as TaskStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({getStatusCount(status as TaskStatus)})
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No tasks found</p>
              <p className="text-gray-400 text-sm mb-4">
                {statusFilter === 'ALL'
                  ? 'Create your first task to get started!'
                  : `No tasks with status "${STATUS_LABELS[statusFilter as TaskStatus]}"`}
              </p>
              {statusFilter === 'ALL' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => {
                const nextStatus = getNextStatus(task.status);
                return (
                  <div
                    key={task._id}
                    className="p-6 hover:bg-gray-50 transition-all cursor-pointer group"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[task.status]}`}
                              >
                                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                                {STATUS_LABELS[task.status]}
                              </span>
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${PRIORITY_COLORS[task.priority]}`}
                              >
                                <span className="mr-1.5">{PRIORITY_ICONS[task.priority]}</span>
                                {task.priority}
                              </span>
                              {task.assignee && (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  {task.assignee.name}
                                </span>
                              )}
                              <span className="inline-flex items-center text-xs text-gray-500" title={`Created by ${task.createdBy.name}`}>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {task.createdBy.name}
                              </span>
                              <span className="inline-flex items-center text-xs text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {nextStatus && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task._id, nextStatus);
                            }}
                            className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
                          >
                            <span className="inline-flex items-center">
                              Move to {STATUS_LABELS[nextStatus]}
                              <svg
                                className="w-4 h-4 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task);
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
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

      {/* Task Detail Sheet */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isOpen={isSheetOpen}
          onClose={handleSheetClose}
          onStatusChange={handleStatusChange}
        />
      )}
    </Layout>
  );
}
