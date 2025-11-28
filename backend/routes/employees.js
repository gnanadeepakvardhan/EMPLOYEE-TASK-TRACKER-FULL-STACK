import express from 'express';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============ EMPLOYEE ROUTES ============

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
});

// GET single employee with their tasks
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const tasks = await Task.find({ assignedTo: req.params.id });
    res.json({
      success: true,
      data: {
        ...employee.toObject(),
        tasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message,
    });
  }
});

// POST create new employee
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, department, position } = req.body;

    if (!name || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      position,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message,
    });
  }
});

// PUT update employee
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, department, position, status } = req.body;

    const updateData = {};
    if (typeof name !== 'undefined') updateData.name = name;
    if (typeof email !== 'undefined') updateData.email = email;
    if (typeof department !== 'undefined') updateData.department = department;
    if (typeof position !== 'undefined') updateData.position = position;
    if (typeof status !== 'undefined') updateData.status = status;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message,
    });
  }
});

// DELETE employee
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Delete all tasks assigned to this employee
    await Task.deleteMany({ assignedTo: req.params.id });

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
});

export default router;
