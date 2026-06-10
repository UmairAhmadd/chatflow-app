# ChatFlow 💬

A full-stack, real-time chat application for remote teams. Direct messages, group
chats, presence, typing indicators, read receipts, and image/file sharing — wrapped
in a clean, dark, Linear/Vercel-style UI.

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Socket.io-client, Framer Motion, NextAuth.js, Spline |
| Backend  | Node.js, Express, Socket.io, MongoDB + Mongoose, JWT, Bcrypt, Cloudinary |

## Project Structure

```
ChatFlow App/
├── backend/
│   ├── server.js              # Express + Socket.io entry
│   ├── config/                # db.js, cloudinary.js
│   ├── models/                # User, Message, Conversation, Group
│   ├── routes/                # auth, user, chat, group, media
│   ├── middleware/            # authMiddleware.js (JWT protect + token gen)
│   └── socket/                # socketHandler.js (presence, messaging, typing, read)
└── frontend/
    ├── app/
    │   ├── (auth)/            # login + register (split layout w/ Spline)
    │   ├── chat/             # 3-column chat app
    │   ├── profile/          # profile editor
    │   └── api/auth/         # NextAuth route handler
    ├── components/           # ui/ + chat/ components
    ├── hooks/                # useChatSocket
    └── lib/                  # api, socket, store (Zustand), auth, types
```

## Features

- 🔐 JWT auth with protected routes (Credentials + Google OAuth via NextAuth)
- 💬 Real-time DMs and group chats over Socket.io
- 🟢 Online/offline presence (green dot)
- ✓✓ Read receipts (blue double tick)
- ⌨️ Typing indicators ("Ali is typing…")
- 📎 Image & file sharing via Cloudinary
- 🔴 Unread message badges
- 👤 Profile page (name, bio, avatar)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A Cloudinary account (for media uploads)
- Google OAuth credentials (optional, for Google sign-in)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values
npm run dev               # starts on http://localhost:5000
```

`.env`:
```
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/chatflow
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
CLOUDINARY_NAME=<...>
CLOUDINARY_KEY=<...>
CLOUDINARY_SECRET=<...>
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # starts on http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<long random string>
GOOGLE_ID=<google client id>
GOOGLE_SECRET=<google client secret>
```

> The Spline 3D robot component was added per spec:
> `npx shadcn@latest add https://21st.dev/r/serafimcloud/splite`
> A ready-to-use `components/ui/splite.tsx` is already included.

### 3. Use it
1. Open http://localhost:3000 → redirected to `/login`.
2. Register two accounts (or use Google) in two browsers/incognito windows.
3. Start a DM via the **+** button, or create a group from the Groups tab.
4. Watch real-time messages, typing indicators, presence, and read receipts.

---

## Socket.io Events

| Event            | Direction        | Purpose |
|------------------|------------------|---------|
| `user:online` / `user:offline` | server → all | presence broadcast |
| `users:online`   | server → client  | initial online list |
| `room:join`      | client → server  | join a DM/group room |
| `message:send`   | client → server  | send a message |
| `message:new`    | server → room    | new message delivered |
| `message:read`   | both             | mark/notify read (blue tick) |
| `typing:start` / `typing:stop` | both | typing indicator |

## Data Models

- **User**: name, email, password (hashed), avatar, bio, isOnline, lastSeen
- **Message**: sender, roomId, roomType (dm/group), content, type (text/image/file), fileUrl, readBy[]
- **Conversation**: participants[2], lastMessage
- **Group**: name, avatar, admin, members[], lastMessage

## Notes
- Auth uses NextAuth on the frontend; the backend issues its own JWT that the client
  stores and sends as a `Bearer` token (and to authenticate the socket handshake).
- Read receipts and presence are best-effort and broadcast per-room.
