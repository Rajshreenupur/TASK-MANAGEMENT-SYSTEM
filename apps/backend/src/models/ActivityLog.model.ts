import mongoose, { Document, Schema } from 'mongoose';

export type ActivityAction = 'TASK_CREATED' | 'TASK_STATUS_CHANGED' | 'TASK_ASSIGNED' | 'TASK_UPDATED';

export interface IActivityLog extends Document {
  taskId: mongoose.Types.ObjectId;
  action: ActivityAction;
  performedBy: mongoose.Types.ObjectId;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    action: {
      type: String,
      enum: ['TASK_CREATED', 'TASK_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UPDATED'],
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousValue: {
      type: String,
    },
    newValue: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ performedBy: 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

