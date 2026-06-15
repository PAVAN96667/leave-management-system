# Leave Management System

A full-stack Leave Management System built with NestJS for the backend and Next.js for the frontend. It supports role-based access control with three roles: Admin, Manager, and Employee.

---

## Tech Stack

- Frontend: Next.js 16, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma 6
- Authentication: JWT (JSON Web Tokens)
- Password Hashing: bcryptjs

---

## Roles and Permissions

Admin can create users, create leave types, allocate leave balances, view all leaves, approve or reject any leave, and apply for their own leave.

Manager can view and approve or reject their team's leave requests, apply for their own leave, and view their own leave balance and history.

Employee can view their leave balance, apply for leave, view their leave request status, and cancel a pending leave request.

---

## Leave Workflow

An employee, manager, or admin applies for leave. The leave status becomes Pending Approval. The manager or admin then reviews the request and either approves or rejects it. If approved, the leave balance is automatically deducted. If rejected, the reason is stored and shown to the employee.

---

## Project Structure

The project has two main parts. The backend is built with NestJS and contains the following folders inside src: auth for authentication, users for user management, leave for leave management, and prisma for the database service. The frontend is built with Next.js and contains pages for login, register, and three dashboards for admin, manager, and employee.

---

## How to Run the Project

### Step 1 - Clone the Repository
