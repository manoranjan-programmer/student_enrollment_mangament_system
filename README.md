# 🎓 AI-Powered Student Course Registration & Result Management System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

A modern, full-stack Academic Management System designed to streamline student course registration, result processing, and faculty management. Built with the PERN stack (PostgreSQL, Express, React, Node.js), this system offers a robust and scalable solution for educational institutions.

---

## 🚀 Key Features

- **🔐 Secure Authentication**: Role-based access control (RBAC) for Admin, Faculty, and Students using JWT and Bcrypt.
- **📚 Course Management**: Automated department-specific course code generation and intelligent course assignment.
- **📝 Result & Attendance**: Comprehensive modules for faculty to publish results and track daily attendance.
- **📊 Interactive Dashboard**: Visual data analytics using Chart.js for GPA trends and enrollment statistics.
- **📄 Document Generation**: Export professional academic transcripts and reports to PDF using `jsPDF`.
- **📱 Responsive UI**: A premium, mobile-friendly design with dark mode support and sleek transitions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (v18+)
- **Styling**: Vanilla CSS / CSS Modules
- **State Management**: React Hooks
- **Charts**: Chart.js / react-chartjs-2
- **Icons**: FontAwesome

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Auth**: JSON Web Tokens (JWT) & BcryptJS

---

## 📂 Project Structure

```text
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard & Module pages
│   │   └── assets/      # Styles & Images
│   └── public/
├── server/              # Node.js Express Backend
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── models/          # Database interaction
│   └── middleware/      # Auth & Error handling
└── database/            # SQL Schema & Migration scripts
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/student-management-system.git
cd student-management-system
```

### 2. Database Setup
- Create a PostgreSQL database named `student_mgmt`.
- Execute the schema file located in `database/schema.sql`.
```bash
psql -U postgres -d student_mgmt -f database/schema.sql
```

### 3. Backend Configuration
```bash
cd server
npm install
```
- Create a `.env` file in the `server` directory and add:
```env
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/student_mgmt
JWT_SECRET=your_secret_key
```
- Start the server:
```bash
npm run dev
```

### 4. Frontend Configuration
```bash
cd client
npm install
npm start
```

---

## 📸 Screenshots

*(Add your screenshots here)*
| Dashboard | Course Registration | Attendance |
|-----------|---------------------|------------|
| ![Dash](https://via.placeholder.com/300x150?text=Dashboard) | ![Courses](https://via.placeholder.com/300x150?text=Registration) | ![Attendance](https://via.placeholder.com/300x150?text=Tracking) |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [Your Name]**
