# InfernoPizza 🍕

A professional full-stack pizza delivery web application.

## Tech Stack
| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Vite + Tailwind CSS v4    |
| Backend    | Node.js + Express                 |
| Database   | MongoDB + Mongoose                |
| HTTP       | Axios                             |
| Routing    | React Router DOM v6               |

---

## Project Structure
```
Inferno Project/
├── frontend/          # React + Vite client
└── backend/           # Express REST API
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Start the Backend
```bash
cd backend
# copy and fill in .env.example → .env
npm run dev
# API: http://localhost:5000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

---

## API Endpoints (Stage 1)

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | /api/health      | Server & DB health check |
| GET    | /api/pizzas      | List all available pizzas|
| GET    | /api/pizzas/:id  | Get a single pizza       |

---

## Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/oasis_pizza
CLIENT_ORIGIN=http://localhost:5173
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```
