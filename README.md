# Employee Task Tracker

A complete fullstack web application for managing employees and their tasks within a company. Built with React (Frontend), Node.js + Express (Backend), and MongoDB (Database).

## Screenshots
drive link: https://drive.google.com/drive/folders/1cB_Ty7mY3YlxbYx1JVhSkEr4GGUioG9h?usp=drive_link

## 🎯 Features

- **Dashboard**: View summary statistics including total employees, tasks, completion rates, and employee performance
- **Employee Management**: Create, read, update, and delete employees with department and position information
- **Task Management**: Create, update, and manage tasks with priority levels, due dates, and assignment tracking
- **Task Filtering**: Filter tasks by status (pending, in-progress, awaiting-approval, completed) and assigned employee
- **Role-Based Access Control**: Admins manage everything; employees only see their tasks and can’t edit other data
- **Completion Requests**: Employees can request task approval with notes/screenshots, admins approve/reject with feedback
- **Performance Analytics**: Track employee productivity and task completion rates
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📋 Tech Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 with responsive design
- **Development Server**: Vite dev server

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Middleware**: CORS, Body Parser
- **Environment**: Dotenv for configuration

### Database
- **Type**: NoSQL (MongoDB)
- **Schemas**: Employee and Task with proper relationships

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/employee-task-tracker
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   ```

4. **Seed the database** (optional - creates sample data)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with the following variable:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Application will open at `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Employees Endpoints

#### GET all employees
```
GET /employees
```
**Response**: Array of all employees

#### GET single employee with tasks
```
GET /employees/:id
```
**Response**: Employee object with associated tasks

#### POST create employee
```
POST /employees
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "position": "Senior Developer"
}
```
**Required fields**: name, email, department, position

#### PUT update employee
```
PUT /employees/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "department": "Product",
  "position": "Product Manager",
  "status": "active"
}
```

#### DELETE employee
```
DELETE /employees/:id
```

### Tasks Endpoints

#### GET all tasks (with optional filters)
```
GET /tasks
GET /tasks?status=pending
GET /tasks?assignedTo=EMPLOYEE_ID
GET /tasks?priority=high
```
**Query Parameters**:
- `status`: pending, in-progress, awaiting-approval, completed
- `assignedTo`: Employee ID
- `priority`: low, medium, high

#### GET single task
```
GET /tasks/:id
```

#### POST create task
```
POST /tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Setup JWT-based authentication",
  "assignedTo": "EMPLOYEE_ID",
  "priority": "high",
  "dueDate": "2025-12-15"
}
```
**Required fields**: title, assignedTo, dueDate
**Priority values**: low, medium, high (default: medium)
**Status values**: pending, in-progress, awaiting-approval, completed (default: pending)

#### PUT update task
```
PUT /tasks/:id
Content-Type: application/json

{
  "status": "in-progress",
  "priority": "high"
}
```

#### DELETE task
```
DELETE /tasks/:id
```

#### POST request completion (employee)
```
POST /tasks/:id/request-completion
Content-Type: application/json

{
  "note": "Feature deployed to staging, please verify",
  "attachments": [
    { "name": "Demo video", "url": "https://drive.google.com/..." }
  ]
}
```

#### POST approve completion (admin)
```
POST /tasks/:id/approve-completion
Content-Type: application/json

{
  "responseNote": "Looks great, marking done"
}
```

#### POST reject completion (admin)
```
POST /tasks/:id/reject-completion
Content-Type: application/json

{
  "responseNote": "API test still failing, please fix"
}
```

### Dashboard Endpoint

#### GET dashboard summary
```
GET /dashboard
```
**Response**:
```json
{
  "summary": {
    "totalEmployees": 5,
    "totalTasks": 10,
    "completedTasks": 3,
    "pendingTasks": 4,
    "inProgressTasks": 3,
    "awaitingApprovalTasks": 1,
    "completionRate": 30
  },
  "tasksByPriority": {
    "high": 5,
    "medium": 3,
    "low": 2
  },
  "tasksByEmployee": [
    {
      "_id": "EMPLOYEE_ID",
      "employeeName": "John Smith",
      "totalTasks": 3,
      "completedTasks": 1,
      "completionRate": 33
    }
  ]
}
```

## 🗄️ Database Schema

### Employee Collection
```javascript
{
  _id: ObjectId,
  name: String (required, min 2 chars),
  email: String (required, unique, valid email),
  department: String (required),
  position: String (required),
  status: String (enum: ['active', 'inactive'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String (required, min 3 chars),
  description: String,
  status: String (enum: ['pending', 'in-progress', 'awaiting-approval', 'completed'], default: 'pending'),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  assignedTo: ObjectId (ref: Employee, required),
  dueDate: Date (required),
  completedAt: Date,
  completionRequest: {
    status: String (enum: ['none', 'pending', 'approved', 'rejected']),
    note: String,
    attachments: [{ name: String, url: String }],
    requestedBy: ObjectId (ref: User),
    requestedAt: Date,
    responseNote: String,
    respondedBy: ObjectId (ref: User),
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Components

### Pages
- **Dashboard**: Summary statistics and performance metrics
- **Employees**: List, create, edit, and delete employees
- **Tasks**: List, create, edit, and delete tasks with filtering

### Features
- Responsive card-based layouts
- Real-time filtering and sorting
- Form validation
- Error handling and user feedback
- Modal forms for create/edit operations
- Progress bars for visual task tracking

## 🔄 Data Flow

```
Frontend (React) → Axios API Client → Express Backend → MongoDB
```

1. User interacts with React UI
2. Components call API service methods
3. Axios sends HTTP requests to backend
4. Express routes handle requests
5. Mongoose manages database operations
6. Response is returned to frontend
7. React components update with new data

## 📊 Sample Data

The `seed.js` script creates:
- 5 sample employees across different departments
- 10 sample tasks with various statuses, priorities, and assignments

Run `npm run seed` in the backend directory to populate sample data.

## 🛠️ Development Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm run start    # Start production server
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔒 Error Handling

- **Validation**: All inputs are validated before database operations
- **Error Messages**: Clear, user-friendly error messages
- **HTTP Status Codes**: Proper status codes (201 for create, 404 for not found, etc.)
- **Try-Catch Blocks**: Comprehensive error handling throughout

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for tablet and desktop
- Flexible grid layouts
- Touch-friendly button sizes

## 🎯 Assumptions & Limitations

### Assumptions
- MongoDB is running locally or accessible via connection string
- Frontend and backend run on same machine for development
- CORS is enabled for local development (localhost:5173)
- Email addresses are unique identifiers for employees
- Tasks require an assigned employee

### Limitations
- No real-time updates (dashboard polls every 30 seconds)
- No task attachment/file upload support
- No task comments or activity logs
- No email notifications
- Single-page application (no multiple instances)

## 🔐 Authentication & Roles

- Login/Register endpoints issue JWT tokens that the frontend stores and sends with every request.
- Seed script creates one admin (full access) and one employee account bound to an existing employee record.
- Admin abilities:
  - CRUD employees and tasks
  - View dashboard analytics
  - Approve or reject completion requests with feedback
- Employee abilities:
  - View only their assigned tasks
  - Submit completion requests with notes + attachment links
  - See admin responses/rejections inline

Run `npm run seed` after configuring the `.env` file to recreate the default admin/employee accounts, then log in through the UI.

## 📸 Screenshots

### Dashboard
- Summary cards showing key metrics
- Task status breakdown with progress bars
- Employee performance table

### Employees Page
- Grid of employee cards
- Quick edit/delete actions
- Add new employee form

### Tasks Page
- List of all tasks with details
- Filter by status and employee
- Priority and status badges
- Add new task form

## 🤝 Contributing

To extend this application:
1. Create feature branches
2. Add tests for new functionality
3. Update API documentation
4. Test on multiple devices

## 📄 License

This project is created as part of ProU Technology Fullstack Web Application Assignment.

## 📞 Support

For issues or questions:
1. Check the API documentation above
2. Review error messages in browser console
3. Check backend server logs
4. Verify MongoDB connection

## 🎓 Learning Outcomes

This project demonstrates:
- RESTful API design with Express
- MongoDB schema design and relationships
- React component architecture
- State management
- API integration with Axios
- Responsive CSS design
- Error handling best practices
- Database operations (CRUD)
- Full-stack development workflow
