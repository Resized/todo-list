# To-Do List

A modern, responsive todo list application with a React/Redux frontend and Node.js/MongoDB backend.

## Features

- ✨ Clean and intuitive user interface
- 🌓 Dark/Light mode toggle
- 💾 MongoDB backend for data persistence
- ⚡ Real-time updates
- 🎨 Material-UI components
- 📱 Responsive design

## Tech Stack

- Frontend (Client):

  - React
  - Redux
  - Material-UI
  - TypeScript
  - CSS

- Backend (Server):
  - Node.js
  - MongoDB
  - Mongoose

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install
```

```bash
# Install client dependencies
cd ../client
npm install
```

3. Start the development servers:

```bash
# Start the backend server (from the server directory)
cd server
npm start
```

```bash
# Start the frontend development server (from the client directory)
cd client
npm start
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000` (or your configured port).

## Environment Variables

### Client

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Server

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-list
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
