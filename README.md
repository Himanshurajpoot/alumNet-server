
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
COLLEGE_EMAIL_DOMAIN=college.edu
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
- PUT `/api/auth/me` (Bearer token) { name?, graduationYear?, department?, batch?, course?, currentJob? }
- POST `/api/auth/forgot-password` { email }
- POST `/api/auth/reset-password` { token, password }

## Posts Endpoints
- GET `/api/posts?page=1&limit=10&search=query` (supports pagination and search)
- GET `/api/posts/:id`
- POST `/api/posts` (auth) { title, content, image? }
- PATCH `/api/posts/:id` (auth) { title?, content?, image? }
- DELETE `/api/posts/:id` (auth)
- POST `/api/posts/:id/like` (auth)
- POST `/api/posts/:id/comment` (auth) { text }

## Events Endpoints
- GET `/api/events?page=1&limit=10` (supports pagination)
- GET `/api/events/:id`
- POST `/api/events` (auth) { title, date, location, description? }
- PATCH `/api/events/:id` (auth) { title?, date?, location?, description? }
- DELETE `/api/events/:id` (auth)
- POST `/api/events/:id/attend` (auth)
- POST `/api/events/:id/leave` (auth)

## Security Features
- Rate limiting: 100 requests per 15 minutes (general), 5 requests per 15 minutes (auth endpoints)
- Input sanitization to prevent NoSQL injection attacks
- Enhanced file upload validation (MIME type + extension checking)
- Password reset functionality with secure token generation
- JWT-based authentication with role-based access control

## Notes
- Auth uses Bearer token in `Authorization` header; cookies also supported via `token` if you choose to set it.
- Update `CLIENT_ORIGIN` to your frontend origin(s), comma-separated for multiple.
- Password reset tokens expire after 10 minutes.
- File uploads are limited to 2MB and only image files (PNG, JPEG, GIF, WebP).
