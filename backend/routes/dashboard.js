import express from 'express';
import Task from '../models/Task.js';
import Employee from '../models/Employee.js';

const router = express.Router();

// GET dashboard summary
router.get('/', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({
      status: 'in-progress',
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get task summary by employee
    const tasksByEmployee = await Task.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 1,
          employeeName: '$employee.name',
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$completedTasks', '$totalTasks'] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { totalTasks: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate,
        },
        tasksByPriority: tasksByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        tasksByEmployee,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

export default router;
