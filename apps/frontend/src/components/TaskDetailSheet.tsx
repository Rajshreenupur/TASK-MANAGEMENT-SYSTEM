import { useEffect, useState } from 'react';
import { taskApi, Task, TaskStatus, ActivityLog } from '../api/task';

interface TaskDetailSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  BACKLOG: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
};

const ACTION_LABELS: Record<string, string> = {
  TASK_CREATED: 'Task Created',
  TASK_STATUS_CHANGED: 'Status Changed',
  TASK_ASSIGNED: 'Assigned',
  TASK_UPDATED: 'Updated',
};

export default function TaskDetailSheet({
  task,
  isOpen,
  onClose,
  onStatusChange,
}: TaskDetailSheetProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [taskData, setTaskData] = useState<Task>(task);

  useEffect(() => {
    setTaskData(task);
  }, [task]);

  useEffect(() => {
    if (isOpen && task._id) {
      fetchActivityLogs();
      fetchTaskDetails();
    }
  }, [isOpen, task._id]);

  const fetchActivityLogs = async () => {
    try {
      setLoadingLogs(true);
      const response = await taskApi.getActivityLogs(task._id, 1, 50);
      setActivityLogs(response.logs);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchTaskDetails = async () => {
    try {
      const response = await taskApi.getById(task._id);
      setTaskData(response.task);
    } catch (err) {
      console.error('Failed to load task details', err);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChangeDescription = (log: ActivityLog) => {
    if (log.action === 'TASK_CREATED') {
      return `Task created with status: ${log.newValue}`;
    }
    if (log.action === 'TASK_STATUS_CHANGED') {
      return `Status changed from ${log.previousValue} to ${log.newValue}`;
    }
    if (log.action === 'TASK_ASSIGNED') {
      return `Assigned to user (${log.newValue})`;
    }
    return `${ACTION_LABELS[log.action] || log.action}`;
  };

  if (!isOpen) return null;

  const nextStatus = getNextStatus(taskData.status);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{taskData.title}</h3>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[taskData.status]}`}
              >
                {STATUS_LABELS[taskData.status]}
              </span>
              {nextStatus && (
                <button
                  onClick={async () => {
                    await onStatusChange(taskData._id, nextStatus);
                    await fetchTaskDetails();
                    await fetchActivityLogs();
                  }}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Move to {STATUS_LABELS[nextStatus]}
                </button>
              )}
            </div>
          </div>

          {/* Task Description */}
          {taskData.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{taskData.description}</p>
            </div>
          )}

          {/* Task Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Priority</h4>
              <p className="text-gray-600 capitalize">{taskData.priority.toLowerCase()}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Created By</h4>
              <p className="text-gray-600">{taskData.createdBy.name}</p>
            </div>
            {taskData.assignee && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Assigned To</h4>
                <p className="text-gray-600">{taskData.assignee.name}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Created At</h4>
              <p className="text-gray-600">{formatDate(taskData.createdAt)}</p>
            </div>
          </div>

          {/* Activity Log */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h4>
            {loadingLogs ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading activity logs...</div>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity logs found.
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {getStatusChangeDescription(log)}
                        </p>
                        <span className="text-xs text-gray-500 ml-4">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        by {log.performedBy.name}
                      </p>
                      {log.previousValue && log.newValue && (
                        <div className="mt-2 flex items-center space-x-2 text-xs">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                            {log.previousValue}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            {log.newValue}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

