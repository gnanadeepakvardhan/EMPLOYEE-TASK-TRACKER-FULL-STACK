import mongoose from 'mongoose';
import Employee from './models/Employee.js';
import Task from './models/Task.js';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

await connectDB();

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
    // Clear existing data
    await Employee.deleteMany({});
    await Task.deleteMany({});

    // Insert employees
    const createdEmployees = await Employee.insertMany(employees);
    console.log(`✓ Created ${createdEmployees.length} employees`);

    // Create tasks
    const tasks = [
      {
        title: 'Implement user authentication',
        description: 'Setup JWT-based authentication for the application',
        status: 'in-progress',
        priority: 'high',
        assignedTo: createdEmployees[0]._id,
        dueDate: new Date('2025-12-15'),
      },
      {
        title: 'Design new dashboard',
        description: 'Create mockups and design for the main dashboard',
        status: 'pending',
        priority: 'high',
        assignedTo: createdEmployees[3]._id,
        dueDate: new Date('2025-12-10'),
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'pending',
        priority: 'medium',
        assignedTo: createdEmployees[4]._id,
        dueDate: new Date('2025-12-20'),
      },
      {
        title: 'Optimize database queries',
        description: 'Review and optimize slow database queries',
        status: 'completed',
        priority: 'medium',
        assignedTo: createdEmployees[0]._id,
        dueDate: new Date('2025-11-20'),
        completedAt: new Date('2025-11-18'),
      },
      {
        title: 'Fix responsive design issues',
        description: 'Ensure all pages are responsive on mobile devices',
        status: 'in-progress',
        priority: 'high',
        assignedTo: createdEmployees[2]._id,
        dueDate: new Date('2025-12-08'),
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints',
        status: 'pending',
        priority: 'medium',
        assignedTo: createdEmployees[0]._id,
        dueDate: new Date('2025-12-25'),
      },
      {
        title: 'Review pull requests',
        description: 'Review and approve pending pull requests',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: createdEmployees[0]._id,
        dueDate: new Date('2025-12-05'),
      },
      {
        title: 'Update user profile page',
        description: 'Add new profile fields and update styling',
        status: 'pending',
        priority: 'low',
        assignedTo: createdEmployees[2]._id,
        dueDate: new Date('2025-12-30'),
      },
      {
        title: 'Setup monitoring and alerting',
        description: 'Configure Sentry and DataDog for production monitoring',
        status: 'pending',
        priority: 'medium',
        assignedTo: createdEmployees[4]._id,
        dueDate: new Date('2025-12-18'),
      },
      {
        title: 'Create user onboarding flow',
        description: 'Design and implement welcome/onboarding screens',
        status: 'in-progress',
        priority: 'high',
        assignedTo: createdEmployees[3]._id,
        dueDate: new Date('2025-12-12'),
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✓ Created ${createdTasks.length} tasks`);

    console.log('\n✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
