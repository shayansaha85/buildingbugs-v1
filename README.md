# 🏢 BuildingBugs

A modern building management system for handling tenant requests and maintenance.

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/en/download) 
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shayansaha85/buildingbugs-v1.git
   ```

2. **Setup Configuration**
   - Navigate to the project root directory
   - Locate the `.env` file
   - Update MongoDB URL if needed (default works for local MongoDB installation)

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Launch Application**
   ```bash
   npm run dev
   ```
   This will start:
   - Frontend at: `http://localhost:5173`
   - Backend at: `http://localhost:5000`

5. **Setup Admin Account**
   ```bash
   # On MongoDB Shell execute these commands
   
   use building-management

   db.users.insertOne({
     username: "admin",
     password: "admin",
     role: "admin",
     createdAt: new Date()
   })
   ```

### 🎯 Access Application

1. Open your browser and visit: `http://localhost:5173`
2. Login with default admin credentials:
   - Username: `admin`
   - Password: `admin`
3. Start adding customer users for each flat

## 💡 Next Steps
- Create customer accounts
- Manage building maintenance requests
- Track tenant issues
- Generate reports

> Note: Make sure both MongoDB and Node.js are properly installed before starting the application.


