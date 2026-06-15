# Leave Management System - Backend

Built with NestJS and TypeScript. This is the backend API server for the Leave Management System.

## Tech Stack

- Framework: NestJS with TypeScript
- Database: PostgreSQL
- ORM: Prisma 6
- Authentication: JWT
- Password Hashing: bcryptjs

## Roles

Admin can create users, create leave types, allocate leave balances, view all leaves, approve or reject any leave, and apply for their own leave.

Manager can view and approve or reject their team leave requests, apply for their own leave, and view their own leave balance.

Employee can view their leave balance, apply for leave, view their request status, and cancel a pending leave request.

## Leave Workflow

Employee applies for leave. Status becomes Pending Approval. Manager or Admin approves or rejects. If approved the leave balance is automatically deducted. If rejected the reason is stored and shown to the employee.

## How to Run

Step 1 - Install dependencies

npm install

Step 2 - Create a .env file in the backend folder

DATABASE_URL=postgresql://your_username:your_password@localhost:5432/leave_management
JWT_SECRET=leavemanagementsecretkey2026

Step 3 - Run database migration

npx prisma migrate dev

Step 4 - Create the first admin user

npx ts-node prisma/seed.ts

Step 5 - Start the server

npm run start:dev

Server runs on http://localhost:3001

## Default Login

Username: admin
Password: admin

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

User stores id, name, email, password, role, and the manager they report to.

LeaveType stores id, name, description, and maximum days allowed per year.

LeaveAllocation stores allocated days and used days for each user per leave type per year.

Leave stores the request with user, leave type, reason, start date, end date, status, and rejection reason.

## Key Features

- JWT authentication
- Role based access control for Admin, Manager, and Employee
- Manager hierarchy where employees report to a specific manager
- Leave balance tracking that updates automatically on approval
- Approve or reject leaves with a reason
- Cancel pending leave requests

## License

This project is open source and free to use.
