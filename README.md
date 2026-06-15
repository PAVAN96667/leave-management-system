The frontend will run on http://localhost:3000

---

## Default Login Credentials

The first admin account is created by the seed file.

- Username: admin
- Password: admin

After logging in as admin, you can create managers and employees from the dashboard.

---

## API Endpoints

### Authentication
- POST /auth/login - Login with username and password
- POST /auth/register - Register a new user

### Users
- GET /users/profile - Get the logged in user's profile
- GET /users - Get all users (Admin only)
- POST /users/create - Create a new user (Admin only)
- DELETE /users/:id - Delete a user (Admin only)

### Leave
- GET /leave/types - Get all leave types
- POST /leave/type - Create a leave type (Admin only)
- POST /leave/allocate - Allocate leave to a user (Admin only)
- GET /leave/allocations - Get all allocations (Admin only)
- GET /leave/all - Get all leave requests (Admin only)
- GET /leave/my - Get my leave requests
- GET /leave/my-allocations - Get my leave balance
- POST /leave/apply - Apply for leave
- GET /leave/pending - Get pending approvals (Admin and Manager)
- GET /leave/reportees - Get team leave requests (Manager only)
- PATCH /leave/:id/approve - Approve a leave request (Admin and Manager)
- PATCH /leave/:id/reject - Reject a leave request (Admin and Manager)
- PATCH /leave/:id/cancel - Cancel a leave request

---

## Database Models

User stores the id, name, email, password, role, and the manager they report to.

LeaveType stores the id, name, description, and maximum days allowed per year.

LeaveAllocation stores how many days have been allocated and used for each user per leave type per year.

Leave stores the leave request with the user, leave type, reason, start date, end date, status, and rejection reason if any.

---

## Key Features

- Secure login using JWT tokens
- Role-based access control for Admin, Manager, and Employee
- Manager hierarchy where employees report to a specific manager
- Leave balance tracking that updates automatically when a leave is approved
- Ability to approve or reject leaves with a reason
- Ability to cancel a pending leave request
- Sidebar navigation on all dashboards
- Clean and responsive UI built with Tailwind CSS

---

## License

This project is open source and free to use.
