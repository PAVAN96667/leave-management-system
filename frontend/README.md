# Leave Management System - Frontend

Built with Next.js 16, TypeScript, and Tailwind CSS. This is the frontend for the Leave Management System.

## Tech Stack

- Framework: Next.js 16
- Language: TypeScript
- Styling: Tailwind CSS
- HTTP Client: Axios

## How to Run

Step 1 - Install dependencies

npm install

Step 2 - Start the development server

npm run dev

Frontend runs on http://localhost:3000

Make sure the backend is running on http://localhost:3001 before using the frontend.

## Pages

- /login - Login page for all users
- /register - Register page for new users
- /dashboard/admin - Admin dashboard
- /dashboard/manager - Manager dashboard
- /dashboard/user - Employee dashboard

## Admin Dashboard Sections

- Dashboard - Overview with stats and pending approvals
- Leave Management - View all leaves and pending approvals
- Employees - View all users and create new users
- Leave Configuration - Create leave types, allocate leave balance
- My Time Off - Admin can apply and manage their own leaves

## Manager Dashboard Sections

- Dashboard - Overview with pending approvals count
- Team Leaves - View pending approvals and full team leave history
- My Time Off - Manager can apply and manage their own leaves

## Employee Dashboard Sections

- Dashboard - Overview with leave balance summary
- My Time Off - View balance, apply for leave, and track requests

## Default Login

Username: admin
Password: admin

## License

This project is open source and free to use.
