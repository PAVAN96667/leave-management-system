# Leave Management System

A full-stack Leave Management System built with NestJS for the backend and Next.js for the frontend. It supports role-based access control with three roles: Admin, Manager, and Employee.

## Tech Stack

- Frontend: Next.js 16, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma 6
- Authentication: JWT (JSON Web Tokens)
- Password Hashing: bcryptjs

## Roles and Permissions

Admin can create users, create leave types, allocate leave balances, view all leaves, approve or reject any leave, and apply for their own leave.

Manager can view and approve or reject their team leave requests, apply for their own leave, and view their own leave balance and history.

Employee can view their leave balance, apply for leave, view their leave request status, and cancel a pending leave request.

## Leave Workflow

An employee, manager, or admin applies for leave. The status becomes Pending Approval. The manager or admin then approves or rejects it. If approved, the leave balance is automatically deducted. If rejected, the reason is stored and shown to the applicant.

## How to Run the Project

Step 1 - Clone the repository

git clone your-repo-url
cd LeaveManagementSystem

Step 2 - Backend Setup

cd backend
npm install

Create a file called .env in the backend folder and add these two lines:

DATABASE_URL=postgresql://your_username:your_password@localhost:5432/leave_management
JWT_SECRET=leavemanagementsecretkey2026

Run the database migration:

npx prisma migrate dev

Create the first admin user:

npx ts-node prisma/seed.ts

Start the backend server on port 3001:

npm run start:dev

Step 3 - Frontend Setup

Open a new terminal and run:

cd backend/frontend
npm install
npm run dev

The frontend will run on http://localhost:3000

## Default Login

Username: admin
Password: admin

After logging in as admin you can create managers and employees from the dashboard.

## API Endpoints

Authentication:
- POST /auth/login
- POST /auth/register

Users:
- GET /users/profile
- GET /users (Admin only)
- POST /users/create (Admin only)
- DELETE /users/:id (Admin only)

Leave:
- GET /leave/types
- POST /leave/type (Admin only)
- POST /leave/allocate (Admin only)
- GET /leave/allocations (Admin only)
- GET /leave/all (Admin only)
- GET /leave/my
- GET /leave/my-allocations
- POST /leave/apply
- GET /leave/pending (Admin and Manager)
- GET /leave/reportees (Manager only)
- PATCH /leave/:id/approve (Admin and Manager)
- PATCH /leave/:id/reject (Admin and Manager)
- PATCH /leave/:id/cancel

## Database Models

User stores the id, name, email, password, role, and the manager they report to.

LeaveType stores the id, name, description, and maximum days allowed per year.

LeaveAllocation stores how many days have been allocated and used for each user per leave type per year.

Leave stores the leave request with user, leave type, reason, start date, end date, status, and rejection reason.

## Key Features

- Secure login using JWT tokens
- Role-based access control for Admin, Manager, and Employee
- Manager hierarchy where employees report to a specific manager
- Leave balance tracking that updates automatically when a leave is approved
- Approve or reject leaves with a rejection reason
- Cancel a pending leave request
- Sidebar navigation on all dashboards
- Responsive UI built with Tailwind CSS

## License

This project is open source and free to use.
