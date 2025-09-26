# PulseVote

PulseVote is a full-stack polling application built using the MERN stack (MongoDB, Express, React, Node.js).  
It was scaffolded as part of ICE Tasks 1–4 and includes user authentication, poll management, and Docker support.

---

## Project Structure

```
PulseVote/
│── backend/    # Express API (authentication, polls, Swagger docs, Docker setup)
│── frontend/   # React + Vite application
```

Configuration details can be found in the example environment files:  
- `backend/.env.example`  
- `frontend/.env.example`

---

## Running Locally (without Docker)

1. Set up a MongoDB instance locally or use MongoDB Atlas.  
   - Add your connection string to `backend/.env` as `MONGO_URI`.

2. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Running with Docker

A `docker-compose.yml` file is included to simplify deployment with MongoDB and the API.  
To build and run the containers:

```bash
docker-compose up --build
```

---

## Additional Information

- Swagger API documentation is available in the backend service.  
- Both backend and frontend are scaffolded for straightforward extension and customization.  
- Suitable as a base project for experimenting with the MERN stack and containerization.

---
