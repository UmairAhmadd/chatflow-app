<div align="center">

# ChatFlow 💬

### Real-time chat app for remote teams

[![Live Demo](https://img.shields.io/badge/Live_Demo-chatflow--teams.vercel.app-000000?logo=vercel&logoColor=white)](https://chatflow-teams.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4-7C3AED?logo=auth0&logoColor=white)](https://next-auth.js.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-media-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**[🚀 Live Demo](https://chatflow-teams.vercel.app)**

</div>

---

ChatFlow is a full-stack, real-time messaging app built for remote teams — direct
messages, group chats, presence, typing indicators, and read receipts, with a
clean UI that supports both light and dark themes.

## ✨ Features

- 💬 **Real-time messaging** — instant delivery over Socket.io
- 👤 **Direct messages** — one-to-one conversations
- 👥 **Group chats** — create groups and message many at once
- 🟢 **Online status** — live presence indicator (green dot)
- ✓✓ **Read receipts** — blue double-tick when messages are seen
- ⌨️ **Typing indicators** — see when someone is typing
- 🌗 **Dark / Light mode** — theme toggle, preference saved in `localStorage`
- 📎 **File sharing** — images and files via Cloudinary

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, NextAuth.js, Zustand, Socket.io-client, Framer Motion |
| **Backend** | Node.js, Express, Socket.io, MongoDB + Mongoose, JWT, Bcrypt |
| **Media** | Cloudinary (file uploads) |
| **Deployment** | Frontend on **Vercel**, Backend on **Railway** |

## 📁 Project Structure

```
ChatFlow App/
├── backend/
│   ├── server.js            # Express + Socket.io entry
│   ├── config/              # db.js, cloudinary.js
│   ├── models/              # User, Message, Conversation, Group
│   ├── routes/              # auth, user, chat, group, media
│   ├── middleware/          # authMiddleware.js (JWT protect + token gen)
│   └── socket/              # socketHandler.js (presence, messaging, typing, read)
└── frontend/
    ├── app/
    │   ├── (auth)/          # login + register
    │   ├── chat/            # main chat UI
    │   ├── profile/         # profile editor
    │   └── api/auth/        # NextAuth route handler
    ├── components/          # ui/ + chat/ components
    ├── hooks/               # useChatSocket
    └── lib/                 # api, socket, store (Zustand), auth, types
```

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Node.js 18+**
- A **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas))
- A **Cloudinary** account (for file/image sharing)
- **Google OAuth** credentials (optional, for Google sign-in)

### 1. Clone

```bash
git clone https://github.com/your-username/chatflow.git
cd "ChatFlow App"
```

### 2. Backend

```bash
cd backend
npm install
# create a .env file (see "Environment Variables" below)
npm run dev          # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
# create a .env.local file (see "Environment Variables" below)
npm run dev          # starts on http://localhost:3000
```

Open **http://localhost:3000** — you'll be redirected to `/login`. Register two
accounts (two browsers or an incognito window) to see real-time messaging,
presence, typing, and read receipts in action.

## 🔑 Environment Variables

### Backend — `backend/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin, for CORS (e.g. `http://localhost:3000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign backend JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (optional, default `7d`) |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/chatflow
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

### Frontend — `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |
| `NEXTAUTH_URL` | This app's URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret used by NextAuth to encrypt sessions |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> Generate strong secrets with: `openssl rand -base64 32`

## ☁️ Deployment

**Frontend → Vercel**
- Import the `frontend/` directory as a Vercel project.
- Set env vars: `NEXT_PUBLIC_API_URL` (your Railway backend URL), `NEXTAUTH_URL`
  (your Vercel URL, e.g. `https://chatflow-teams.vercel.app`), `NEXTAUTH_SECRET`,
  and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

**Backend → Railway**
- Deploy the `backend/` directory (`npm start`).
- Set env vars: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, and `CLIENT_URL`
  (your Vercel URL, for CORS). Railway provides `PORT` automatically.

> **Google OAuth:** add `https://<your-vercel-domain>/api/auth/callback/google`
> as an authorized redirect URI, and your Vercel domain as an authorized origin,
> in the Google Cloud Console.

## 📡 Socket.io Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `user:online` / `user:offline` | server → all | presence broadcast |
| `users:online` | server → client | initial online list |
| `room:join` | client → server | join a DM/group room |
| `message:send` | client → server | send a message |
| `message:new` | server → room | new message delivered |
| `message:read` | both | mark / notify read (blue tick) |
| `typing:start` / `typing:stop` | both | typing indicator |

## 📜 Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run dev` | Start API with nodemon |
| `backend/` | `npm start` | Start API (production) |
| `frontend/` | `npm run dev` | Start Next.js dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm start` | Serve the production build |

## 📄 License

Released under the **MIT License**.

---

<div align="center">
Built with ❤️ using Next.js, Express &amp; Socket.io
</div>
