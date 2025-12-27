import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { projectApi, Project } from '../api/project';
import { useAuthStore } from '../store/authStore';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await projectApi.getById(projectId);
      setProject(response.project);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await projectApi.inviteMember(projectId, { email: inviteEmail });
      toast.success('Member invited successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchProject();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to invite member');
    }
  };

  const handleRemoveMemberClick = (memberId: string) => {
    setMemberToRemove(memberId);
    setShowRemoveDialog(true);
  };

  const handleRemoveMember = async () => {
    if (!projectId || !memberToRemove) return;
    try {
      await projectApi.removeMember(projectId, memberToRemove);
      toast.success('Member removed successfully!');
      setShowRemoveDialog(false);
      setMemberToRemove(null);
      fetchProject();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    }
  };

  const isOwner = project?.owner._id === user?.id;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading project...</div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <Link to="/projects" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>

        <div className="flex space-x-4 mb-6">
          <Link
            to={`/projects/${projectId}/tasks`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            View Task List
          </Link>
          <Link
            to={`/projects/${projectId}/board`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            View Kanban Board
          </Link>
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Invite Member
            </button>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Owner:</span> {project.owner.name} ({project.owner.email})
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Members ({project.members.length})</h2>
          </div>
          {project.members.length === 0 ? (
            <p className="text-gray-500">No members yet. Invite someone to get started!</p>
          ) : (
            <ul className="space-y-2">
              {project.members.map((member) => (
                <li
                  key={member._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveMemberClick(member._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {showInviteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Member</h3>
              <form onSubmit={handleInviteMember}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={showRemoveDialog}
          onClose={() => {
            setShowRemoveDialog(false);
            setMemberToRemove(null);
          }}
          onConfirm={handleRemoveMember}
          title="Remove Member"
          message="Are you sure you want to remove this member from the project? This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
        />
      </div>
    </Layout>
  );
}

