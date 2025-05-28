# MEAN Stack Blog Platform

A full-featured, multi-author blog platform built with the MEAN stack (MongoDB, Express.js, Angular, and Node.js). This platform supports real-time commenting, role-based access control, and a responsive user interface.


## 🛠️ Tech Stack

- **Frontend**: Angular 19.2
- **Backend**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **UI Components**: Angular Material

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- Angular CLI (v19)

### Installation

# 1. **Clone the repository**
# 2. **Install dependencies** :
 **Install backend dependencies**
cd backend
npm install

 **Install frontend dependencies**
cd ../frontend
npm install
# 3. **Set up environment variables**
**backend**
  cd backend add .env file : 
MONGO_URI=mongodb://admin:adminpassword@localhost:27017/blogdb?authSource=admin
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:4200
ADMIN_CODE=admin_code
**frontend**
 cd frontend add .env file : 
apiUrl =http://localhost:5000/api
ADMIN_CODE=admin_code
# 4. **Run the application In separate terminal windows*
   backend : in blog ( the root ) run docker-compose up --build 
   frontend : cd frontend ==> ng serve 
# 5. **Access the application** :
  Frontend: http://localhost:4200
  Backend API: http://localhost:5000/api
  API Documentation: http://localhost:5000/api-docs/#/



