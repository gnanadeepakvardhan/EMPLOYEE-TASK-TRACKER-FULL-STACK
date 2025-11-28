import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'awaiting-approval', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Task must be assigned to an employee'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completionRequest: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
      },
      note: {
        type: String,
        trim: true,
      },
      attachments: [
        {
          name: { type: String, trim: true },
          url: { type: String, trim: true },
        },
      ],
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      requestedAt: Date,
      responseNote: {
        type: String,
        trim: true,
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
