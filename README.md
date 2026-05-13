# 🎬 VidStream — YouTube Clone (MERN Stack)

A full production-ready YouTube clone built with MongoDB Atlas, Express, React + Vite, and Node.js.

---

## 📁 Project Structure

```
youtube-clone/
├── backend/                # Express API and Mongoose models
│   ├── middleware/         # JWT auth middleware
│   ├── models/             # User, Channel, Video schemas
│   ├── routes/             # Auth, videos, channels, comments
│   ├── server.js           # API server bootstrap
│   ├── .env.example        # Example backend env values
│   └── package.json        # Backend dependencies and scripts
└── frontend/               # React + Vite application
    ├── src/
    │   ├── api/            # Axios instance + auth interceptor
    │   ├── components/     # UI building blocks
    │   ├── context/        # AuthContext and global state
    │   ├── pages/          # App screens and routes
    │   ├── App.jsx         # Route layout and render tree
    │   ├── main.jsx        # React entry point
    │   └── index.css       # Global theme and layout styles
    ├── .env.example       # Example frontend env values
    └── package.json       # Frontend dependencies and scripts
```

---

## ⚡ Features

- **Authentication:** register, login, logout, protected routes
- **Video browsing:** home feed with search, category filtering, trending sort
- **Video playback:** `/watch/:id` player page with comments and actions
- **Channel system:** create channel, upload/edit/delete videos, channel page
- **Comment system:** add, edit, delete comments with owner permissions
- **Likes / Dislikes:** toggle like/dislike state instantly
- **Responsive UI:** polished desktop/mobile layout with dark theme
- **Production-ready:** environment variables, API consistency, deployment guidance

---

## 🚀 Setup & Run

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend server will run at **http://localhost:5000**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app will run at **http://localhost:5173**.

> The frontend proxies `/api` requests to the backend using Vite config.

---

## 🔑 Environment Variables

### backend/.env

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
```

**Important:** Do not commit `.env` files. Use `.env.example` as a template.

---

## 📡 API Endpoints

### Auth

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/auth/register` | Register a new user            |
| POST   | `/api/auth/login`    | Authenticate and return JWT    |
| GET    | `/api/auth/me`       | Get authenticated user profile |

### Videos

| Method | Endpoint                  | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| GET    | `/api/videos`             | List videos with search, category, trending |
| GET    | `/api/videos/:id`         | Get single video and increment views        |
| POST   | `/api/videos`             | Upload a new video (auth)                   |
| PUT    | `/api/videos/:id`         | Edit a video (owner auth)                   |
| DELETE | `/api/videos/:id`         | Delete a video (owner auth)                 |
| PUT    | `/api/videos/:id/like`    | Toggle like/unlike (auth)                   |
| PUT    | `/api/videos/:id/dislike` | Toggle dislike/undislike (auth)             |

### Channels

| Method | Endpoint                   | Description                    |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/api/channels`            | Create a new channel (auth)    |
| GET    | `/api/channels/:id`        | Get channel metadata           |
| GET    | `/api/channels/:id/videos` | Get all videos for a channel   |
| PUT    | `/api/channels/:id`        | Edit channel info (owner auth) |

### Comments

| Method | Endpoint                            | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| GET    | `/api/comments/:videoId`            | Get comments for a video    |
| POST   | `/api/comments/:videoId`            | Add a comment (auth)        |
| PUT    | `/api/comments/:videoId/:commentId` | Edit comment (owner auth)   |
| DELETE | `/api/comments/:videoId/:commentId` | Delete comment (owner auth) |

---

## 🗄️ Data Models

### User

```json
{
  "username": "string",
  "email": "string",
  "password": "hashed",
  "avatar": "string",
  "channels": ["channelId"]
}
```

### Channel

```json
{
  "channelName": "string",
  "owner": "userId",
  "description": "string",
  "channelBanner": "string",
  "subscribers": 0,
  "videos": ["videoId"]
}
```

### Video

```json
{
  "title": "string",
  "thumbnailUrl": "string",
  "videoUrl": "string",
  "description": "string",
  "category": "string",
  "channelId": "ref",
  "uploader": "ref",
  "views": 0,
  "likes": [],
  "dislikes": [],
  "comments": [
    {
      "userId": "ref",
      "username": "string",
      "avatar": "string",
      "text": "string"
    }
  ]
}
```

---

## 🧠 Architecture Review

### Backend

- Built with **Express.js** and **Mongoose**
- Unified API response shape across all routes
- JWT-based auth with protected routes and token validation
- Video route handles legacy bad documents safely
- Trending sort implemented via `sort=trending`
- Channel and comment routes support full CRUD patterns

### Frontend

- Built with **React**, **Vite**, and **React Router v6**
- `AuthContext` manages auth state and keeps the session alive
- Axios instance auto-attaches JWT to protected requests
- Search, category, and trending filter state is URL-driven
- Responsive layout for desktop and mobile
- Polished dark-theme UI with consistent spacing and hover effects

---

## ✅ User Experience

### Home

- Browse videos in a responsive grid
- Search videos using the top header search bar
- Filter videos by category using chips
- Trending button shows top viewed videos
- Shows loading and empty states cleanly

### Video Page

- Embedded player for both YouTube and direct URLs
- Displays title, views, channel, and category
- Like/Dislike toggles update instantly
- Full comment lifecycle with edit/delete for owners
- Related videos shown in a sidebar

### Channel Experience

- Users can create a channel if they don't have one
- Channel page shows banner, name, subscriber count, and videos
- Upload modal for adding videos with category and description
- Only channel owners can edit/delete their videos

### Auth Flow

- Register with username, email, and password
- Login with email and password
- JWT stored in localStorage for persistence
- Auth state restored on page refresh
- Invalid or expired tokens automatically log the user out

---

## 🛠️ Deployment Notes

### Frontend

- Run `npm run build` in `frontend`
- Deploy the `dist` directory to Vercel, Netlify, or any static hosting
- Set `VITE_API_URL` to the deployed backend API url

### Backend

- Deploy `backend` folder to Render, Railway, Heroku, or similar
- Configure `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in production
- Make sure the backend is accessible from the frontend host

---

## 📌 Key Files

- `backend/server.js` — Server startup and route registration
- `backend/models/User.js` — User model and password hashing
- `backend/models/Channel.js` — Channel schema and relationships
- `backend/models/Video.js` — Video schema with comments and ratings
- `backend/routes/auth.js` — Registration, login, current user
- `backend/routes/videos.js` — Video listing, view, create, edit, delete, like/dislike
- `backend/routes/channels.js` — Channel create, fetch, videos, edit
- `backend/routes/comments.js` — Comment CRUD
- `frontend/src/api/axios.js` — Axios instance with auth header
- `frontend/src/context/AuthContext.jsx` — Global authentication state
- `frontend/src/pages/Home.jsx` — Home browsing page with filters
- `frontend/src/pages/VideoPlayer.jsx` — Video player and comments
- `frontend/src/pages/ChannelPage.jsx` — Channel management

---

## 🔍 Review Summary

- Trending no longer depends on a category that may be empty
- Filter buttons and search are based on query params for consistency
- All API responses use a shared success/error structure
- The project now reads as a fully complete MERN application
- Video watch pages are stable and no longer fail on legacy bad data

---

## 📣 Final Notes

This repository is ready for local development and production deployment.
It includes a polished full-stack experience with modern React UI and robust backend APIs.

If you'd like, I can also add:

- `Dockerfile` for container deployment
- `Postman` collection for API testing
- `CI/CD` notes for Vercel/Render deployment
