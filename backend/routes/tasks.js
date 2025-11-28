import express from 'express';
import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const withTaskRelations = (query) =>
  query
    .populate('assignedTo', 'name email')
    .populate('completionRequest.requestedBy', 'email role')
    .populate('completionRequest.respondedBy', 'email role');

const formatAttachments = (attachments = []) =>
  attachments
    .filter((item) => item && (item.url || item.data))
    .map((item) => ({
      name: item.name?.trim() || 'Attachment',
      url: item.url || item.data,
    }));

// ============ TASK ROUTES ============

// GET all tasks with optional filtering
router.get('/', protect, async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.query;
    const filter = {};

    if (req.user.role === 'user') {
      if (!req.user.employee?._id) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an employee profile',
        });
      }
      filter.assignedTo = req.user.employee._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await withTaskRelations(
      Task.find(filter).sort({ createdAt: -1 })
    );

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message,
    });
  }
});

// GET single task
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await withTaskRelations(Task.findById(req.params.id));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (
      req.user.role === 'user' &&
      (!req.user.employee?._id || task.assignedTo._id.toString() !== req.user.employee._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message,
    });
  }
});

// POST create new task
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, assignedTo, dueDate)',
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
    });

    const populatedTask = await task.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
});

// PUT update task
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;

    const updateData = {};
    if (typeof title !== 'undefined') updateData.title = title;
    if (typeof description !== 'undefined') updateData.description = description;
    if (typeof status !== 'undefined') updateData.status = status;
    if (typeof priority !== 'undefined') updateData.priority = priority;
    if (typeof dueDate !== 'undefined') updateData.dueDate = dueDate;
    if (typeof assignedTo !== 'undefined') updateData.assignedTo = assignedTo;

    // Only modify completedAt when the client provided a status
    if (typeof status !== 'undefined') {
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const task = await withTaskRelations(
      Task.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
});

// DELETE task
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
});

// Employee requests completion review
router.post('/:id/request-completion', protect, async (req, res) => {
  try {
    const { note, attachments } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isAssignedUser =
      req.user.role === 'user' &&
      task.assignedTo.toString() === (req.user.employee?._id?.toString() || '');

    if (!isAssignedUser && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Task already completed',
      });
    }
    if (task.status === 'awaiting-approval') {
      return res.status(400).json({
        success: false,
        message: 'Completion review already pending',
      });
    }

    task.status = 'awaiting-approval';
    task.completionRequest = {
      status: 'pending',
      note: note?.trim() || '',
      attachments: formatAttachments(attachments),
      requestedBy: req.user._id,
      requestedAt: new Date(),
      responseNote: undefined,
      respondedBy: undefined,
      respondedAt: undefined,
    };

    await task.save();
    const populated = await withTaskRelations(Task.findById(task._id));
    res.json({
      success: true,
      message: 'Completion review requested',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to request completion',
      error: error.message,
    });
  }
});

// Admin approves completion
router.post('/:id/approve-completion', protect, authorize('admin'), async (req, res) => {
  try {
    const { responseNote } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'awaiting-approval') {
      return res.status(400).json({
        success: false,
        message: 'No completion review pending for this task',
      });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    const currentRequest =
      typeof task.completionRequest?.toObject === 'function'
        ? task.completionRequest.toObject()
        : { ...(task.completionRequest || {}) };
    task.completionRequest = {
      ...currentRequest,
      status: 'approved',
      responseNote: responseNote?.trim() || 'Approved',
      respondedBy: req.user._id,
      respondedAt: new Date(),
    };

    await task.save();
    const populated = await withTaskRelations(Task.findById(task._id));
    res.json({
      success: true,
      message: 'Task marked as completed',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve completion',
      error: error.message,
    });
  }
});

// Admin rejects completion
router.post('/:id/reject-completion', protect, authorize('admin'), async (req, res) => {
  try {
    const { responseNote } = req.body;
    if (!responseNote) {
      return res.status(400).json({
        success: false,
        message: 'Response note is required to reject a completion request',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'awaiting-approval') {
      return res.status(400).json({
        success: false,
        message: 'No completion review pending for this task',
      });
    }

    task.status = 'in-progress';
    const currentRequest =
      typeof task.completionRequest?.toObject === 'function'
        ? task.completionRequest.toObject()
        : { ...(task.completionRequest || {}) };
    task.completionRequest = {
      ...currentRequest,
      status: 'rejected',
      responseNote: responseNote.trim(),
      respondedBy: req.user._id,
      respondedAt: new Date(),
    };

    await task.save();
    const populated = await withTaskRelations(Task.findById(task._id));
    res.json({
      success: true,
      message: 'Completion request rejected',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject completion',
      error: error.message,
    });
  }
});

export default router;
