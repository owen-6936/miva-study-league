import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useLiveStore } from '@/lib/stores/live-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import type { SocketEvents } from '@/lib/api/types';

/**
 * Socket.IO backend URL used for realtime events.
 */
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client instance.
 *
 * The instance is lazily created and wired with all frontend event handlers once.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    });

    // Attach auth token on connect
    socket.on('connect', () => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        socket?.emit('authenticate', { token });
      }
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    // ---- Register event handlers ----
    registerEventHandlers(socket);
  }

  return socket;
}

/**
 * Register all server event listeners and map payloads to Zustand stores.
 */
function registerEventHandlers(sock: Socket) {
  sock.on('leaderboard:update', (data: SocketEvents['leaderboard:update']) => {
    useLiveStore.getState().setLiveLeaderboard(data);
  });

  sock.on('challenge:started', (data: SocketEvents['challenge:started']) => {
    const remainingSeconds = Math.floor((new Date(data.endsAt).getTime() - Date.now()) / 1000);
    useLiveStore.getState().startLive(data.challengeId, data.roundId, remainingSeconds);
  });

  sock.on('challenge:tick', (data: SocketEvents['challenge:tick']) => {
    useLiveStore.getState().setTimer(data.remainingSeconds);
  });

  sock.on('challenge:ended', (_data: SocketEvents['challenge:ended']) => {
    useLiveStore.getState().endLive();
  });

  sock.on('score:update', (data: SocketEvents['score:update']) => {
    const leaderboard = useLiveStore.getState().liveLeaderboard;
    const updated = leaderboard.map((entry) =>
      entry.team.id === data.teamId ? { ...entry, totalPoints: data.totalPoints } : entry,
    );
    useLiveStore.getState().setLiveLeaderboard(updated);
  });

  sock.on('notification:new', (data: SocketEvents['notification:new']) => {
    useNotificationStore.getState().addNotification(data);
  });

  sock.on('timer:sync', (data: SocketEvents['timer:sync']) => {
    useLiveStore.getState().setTimer(data.remainingSeconds);
  });
}

/**
 * Connect to the realtime server if currently disconnected.
 */
export function connectSocket() {
  const sock = getSocket();
  if (!sock.connected) {
    sock.connect();
  }
}

/**
 * Disconnect current socket session if connected.
 */
export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Ask backend to emit a fresh timer sync event for the active challenge.
 */
export function requestTimerSync() {
  socket?.emit('timer:requestSync');
}
