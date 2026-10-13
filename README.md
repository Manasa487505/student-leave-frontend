# Student Leave Request Management System - Frontend

A modern, responsive college leave application web portal built with **React**, **Vite**, and **clean standard CSS** (blue-and-white college theme), connected to a **Java Spring Boot** RESTful backend.

---

## 📌 Architecture & Connected Backend

The frontend communicates directly with the Spring Boot backend running at `http://localhost:8080`:

* **`POST /api/auth/login`**: Authenticates credentials for student or faculty administrator.
* **`GET /api/auth/demo-users`**: Lists available testing credentials.
* **`POST /api/leaves`**: Submits a student's leave request to MySQL.
* **`GET /api/leaves/student/{email}`**: Fetches leave history for the logged-in student.
* **`GET /api/leaves`**: Retrieves all leave applications for faculty review.
* **`PUT /api/leaves/{id}/status`**: Approves or rejects a request with admin remarks (enforced with `X-User-Role: ADMIN`).
* **`GET /api/leaves/stats`**: Fetches overall counts for the dashboard cards.

---

## 🚀 How to Run the Frontend

### 1. Ensure the Backend is Running
Ensure the Spring Boot backend is active at `http://localhost:8080` and connected to MySQL.

### 2. Start the React Frontend
Open your terminal in the frontend folder:
```powershell
cd "c:\Users\Admin\Desktop\tt proj\frontend"
npm run dev
```

### 3. Open in Browser
Open `http://localhost:3000` in your web browser.

---

## 🔑 Demo Login Accounts

| Role | Email / Identifier | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` *(or `aarav_student`)* | `student123` | `http://localhost:3000/student` |
| **Admin / Faculty** | `admin@college.edu` *(or `admin_hod`)* | `admin123` | `http://localhost:3000/admin` |

> 💡 **Quick Testing Tip:** On the Login page, click **"⚡ 1-Click Login"** or **"Fill Student"** / **"Fill Admin"** to test live API authentication immediately without typing!

---

## 📂 Frontend File Structure

```text
frontend/
├── src/
│   ├── api/ or services/
│   │   └── api.js              # Centralized fetch API service with error handling
│   ├── components/
│   │   ├── Navbar.jsx          # Header with user identity and logout
│   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   └── StatusBadge.jsx     # Badges for Pending, Approved, Rejected
│   ├── context/
│   │   ├── AuthContext.jsx     # Live authentication state using /api/auth/login
│   │   └── LeaveContext.jsx    # Live leave state using /api/leaves endpoints
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login screen with role selector & live API call
│   │   ├── StudentDashboard.jsx# Student leave submission & history from MySQL
│   │   └── AdminDashboard.jsx  # Review, approve & reject applications in MySQL
│   ├── styles/                 # Custom CSS stylesheets
│   ├── App.jsx                 # Routing configuration
│   └── main.jsx                # Application root
├── index.html
├── package.json
└── vite.config.js
```
