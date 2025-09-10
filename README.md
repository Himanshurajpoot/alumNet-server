
# AlumniConnect - Backend

Node.js + Express + MongoDB backend with JWT auth for AlumniConnect.

## Tech Stack
- Node.js, Express
- MongoDB, Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js for password hashing
- CORS enabled
- Helmet, Morgan, Cookie Parser, express-validator

## Project Structure
```
src/
  app.js                # Express app, middleware, routes
  server.js             # HTTP server bootstrap
  config/
    env.js              # dotenv loader and required checks
    mongo.js            # Mongoose connection helpers
  controllers/
    auth.controller.js
    post.controller.js
    event.controller.js
  routes/
    auth.routes.js
    post.routes.js
    event.routes.js
  models/
    User.js
    Post.js
    Event.js
  middleware/
    auth.js             # JWT middleware and role guard
    error.js            # Not-found and error handlers
  utils/
    asyncHandler.js
    response.js
  validators/
    auth.validators.js
    content.validators.js
```

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Environment variables
Create a `.env` file in the project root:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/alumni_connect
JWT_SECRET=replace-with-strong-secret
CLIENT_ORIGIN=http://localhost:3000
```

3) Run the server (dev)
```bash
npm run dev
```

Server will start at `http://localhost:${PORT}` and expose `GET /health`.

## Auth Endpoints
- POST `/api/auth/register` { name, email, password, role?, graduationYear?, department? }
- POST `/api/auth/login` { email, password }
- GET `/api/auth/me` (Bearer token)

## Posts Endpoints
- GET `/api/posts`
- GET `/api/posts/:id`
- POST `/api/posts` (auth) { title, content }
- PATCH `/api/posts/:id` (auth)
- DELETE `/api/posts/:id` (auth)
- POST `/api/posts/:id/like` (auth)
- POST `/api/posts/:id/comment` (auth) { text }

## Events Endpoints
- GET `/api/events`
- GET `/api/events/:id`
- POST `/api/events` (auth) { title, date, location, description? }
- PATCH `/api/events/:id` (auth)
- DELETE `/api/events/:id` (auth)
- POST `/api/events/:id/attend` (auth)
- POST `/api/events/:id/leave` (auth)

## Notes
- Auth uses Bearer token in `Authorization` header; cookies also supported via `token` if you choose to set it.
- Update `CLIENT_ORIGIN` to your frontend origin(s), comma-separated for multiple.
