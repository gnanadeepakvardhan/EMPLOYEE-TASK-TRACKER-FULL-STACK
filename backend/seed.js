import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

import Employee from './models/Employee.js';
import Task from './models/Task.js';
import User from './models/User.js';

dotenv.config();

/**
 * 🚫 Prevent accidental seeding in production
 */
if (process.env.NODE_ENV === 'production') {
  console.log('❌ Seeding is disabled in production');
  process.exit(0);
}

/**
 * 📌 Validate required env variables
 */
const requiredEnvVars = [
  'MONGODB_URI',
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD',
  'SEED_USER_EMAIL',
  'SEED_USER_PASSWORD',
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

/**
 * 🧑‍💼 Employees seed data
 */
const employees = [
  {
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    position: 'Senior Developer',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Product',
    position: 'Product Manager',
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'Engineering',
    position: 'Frontend Developer',
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    department: 'Design',
    position: 'UI/UX Designer',
  },
  {
    name: 'Alex Martinez',
    email: 'alex.martinez@company.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});

    console.log('👥 Inserting employees...');
    const createdEmployees = await Employee.insertMany(employees);
    console.log(`✓ ${createdEmployees.length} employees created`);

    console.log('👑 Creating admin user...');
    const adminUser = await User.create({
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`✓ Admin created: ${adminUser.email}`);

    console.log('👤 Creating regular user...');
    const regularUser = await User.create({
      email: process.env.SEED_USER_EMAIL,
      password: process.env.SEED_USER_PASSWORD,
      role: 'user',
      employee: createdEmployees[0]._id,
    });
    console.log(`✓ User created: ${regularUser.email}`);

    console.log('📋 Creating tasks...');
    const tasks = [
      {
        title: 'Implement user authentication',
        description: 'Setup JWT-based authentication',
        status: 'in-progress',
        priority: 'high',
        assignedTo: createdEmployees[0]._id,
        dueDate: new Date('2025-12-15'),
      },
      {
        title: 'Design dashboard UI',
        description: 'Create dashboard wireframes',
        status: 'pending',
        priority: 'high',
        assignedTo: createdEmployees[3]._id,
        dueDate: new Date('2025-12-10'),
      },
      {
        title: 'Setup CI/CD',
        description: 'Configure automated deployment',
        status: 'pending',
        priority: 'medium',
        assignedTo: createdEmployees[4]._id,
        dueDate: new Date('2025-12-20'),
      },
    ];

    await Task.insertMany(tasks);
    console.log(`✓ ${tasks.length} tasks created`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
