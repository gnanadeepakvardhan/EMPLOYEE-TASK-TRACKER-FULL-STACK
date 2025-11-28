import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '1d';

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const serializeUser = (user) => ({
  _id: user._id,
  email: user.email,
  role: user.role,
  employee: user.employee
    ? {
        _id: user.employee._id,
        name: user.employee.name,
        email: user.employee.email,
        department: user.employee.department,
        position: user.employee.position,
      }
    : null,
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'user', employeeId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    let employee = null;
    if (role === 'user') {
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee is required for regular user accounts',
        });
      }
      employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      const employeeAlreadyLinked = await User.findOne({ employee: employeeId });
      if (employeeAlreadyLinked) {
        return res.status(400).json({
          success: false,
          message: 'A user account already exists for this employee',
        });
      }
    }

    const user = await User.create({
      email,
      password,
      role,
      employee: role === 'user' ? employeeId : undefined,
    });
    await user.populate('employee', 'name email department position');

    const token = signToken(user._id);
    res.status(201).json({ success: true, data: serializeUser(user), token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password').populate('employee', 'name email department position');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    const sanitized = user.toObject();
    delete sanitized.password;
    res.json({ success: true, data: serializeUser(sanitized), token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

export default router;
