import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  priority: TaskPriority;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'],
      default: 'BACKLOG',
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ projectId: 1, createdAt: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);

