## 🛠️ Setup Instructions

1. Clone the repository

git clone https://github.com/zenith2110/task-management-system.git
cd task-management-system

2. Setup Backend
cd server
npm install


Create MySQL database:

CREATE DATABASE task_app;


Seed demo users & tasks:

npm run seed


Start backend:

npm run dev


Backend runs on: http://localhost:4000

Demo credentials:

alice@example.com / password123

bob@example.com / password123

3. Setup Frontend
cd ../client
npm install
npm run dev


Frontend runs on: http://localhost:5173

POST /api/tasks – create task

PUT /api/tasks/:id – update task

DELETE /api/tasks/:id – delete task
