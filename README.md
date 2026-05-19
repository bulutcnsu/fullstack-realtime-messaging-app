# Fullstack Realtime Chat Application

# 💬 chatApp - Full-Stack Real-Time Chat Platform

A production-ready, secure, and feature-rich real-time chat application inspired by WhatsApp. Built with a robust **Node.js/Express.js (MVC)** backend and a modern **React/Material-UI** frontend.

---

## ✨ Key Features

### 🔐 Authentication & Security
*   **User Management:** Secure Login & SignUp system.
*   **JWT Auth Architecture:** State-of-the-art authentication utilizing JWT tokens.
*   **Secure Middleware:** Route protection via backend authentication middleware.

### ⚙️ Backend (Express.js)
*   **MVC Architecture:** Extremely clean, scalable, and maintainable Model-View-Controller structure.
*   **Socket.io Integration:** Powering all real-time events, connection states, and instantaneous actions.

### 📱 Frontend (React.js & Material-UI)
*   **WhatsApp-Inspired UI:** Sleek, modern, responsive  chat interface built with Material-UI.
*   **Dynamic Chatrooms:** Create **Public** or **Private** groups seamlessly using an interactive form.
*   **Smart Permissions:** Users can view chat history only *after* joining a public room. Non-joined users are restricted.
*   **Interactive Sidebar:** Clicking on a group avatar instantly lists all registered users in that room.
*   **Direct Messaging:** Select any user from the list to initiate a seamless, instantaneous direct message session.

### ⚡ Advanced Real-Time Chat System
*   **Message Delivery Status:** 
    *   ✔️ **Single Tick:** Message sent successfully to the server.
    *   ✔️✔️ **Double Tick:** Delivered successfully (triggered automatically if the recipient's socket is active).
*   **Advanced Actions (Long Press Feature):** 
    *   Press and hold any room or specific message for **3 seconds** to trigger selection mode.
    *   A context-aware delete icon automatically appears in the top Navbar to securely wipe selected rooms or messages.

---

## 🛠️ Tech Stack

**Frontend:**
*   React.js
*   Material-UI (MUI)
*   Socket.io-client

**Backend:**
*   Node.js & Express.js (MVC Pattern)
*   Socket.io
*   JSON Web Tokens (JWT)
*   Bcrypt (Password Hashing)

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com
cd YOUR_REPO_NAME
```

### 2. Backend Setup
1. Navigate to the server directory (or root if your server is at root):
   ```bash
   # Adjust according to your project structure
   cd BACKEND 
   npm install
   ```
2. Create a `.env` file in the server directory and configure your environment variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
3. Start the backend server:
   ```bash
   cd BACKEND
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal window and navigate to the client directory:
   ```bash
   cd client
   npm install
   ```
2. Start the React development server:
   ```bash
   cd client
   npm start
   ```

---

## 📁 Project Structure

```text
├── client/                 # React Frontend (Material-UI)
│   ├── src/
│   │   ├── components/     # Chat, Sidebar, Modals, Forms
│   │   ├── context/        # Auth & Socket States
│   │   └── ...
├── BACKEND/                 # Express.js Backend (MVC)
│   ├── controllers/        # Auth, Message, Room Controllers
│   ├── models/             # User, Message, Room Schemas
│   ├── routes/             # API Endpoints
│   ├── middlewares/        # Auth Middlewares
│   └── socket.js           # Socket.io & Express Entry Point                
└── README.md
```
