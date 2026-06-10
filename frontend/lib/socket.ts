import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return socket;
}

// Returns the already-connected socket (or null). Use inside components
// that just need to emit, after useChatSocket has established the connection.
export function currentSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
