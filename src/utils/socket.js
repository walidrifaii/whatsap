import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

const getDefaultSocketUrl = () => {
  // 1) Explicit socket URL if provided.
  if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;

  // 2) If API URL is set, reuse the same host (strip trailing /api).
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
  }

  // 3) Final fallback for deployed frontend.
  if (typeof window !== 'undefined') return window.location.origin;

  return 'http://localhost:5000';
};

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(getDefaultSocketUrl(), {
      transports: ['websocket'],
      autoConnect: true
    });
  }
  return socketInstance;
};

export const useSocket = (clientId, handlers = {}) => {
  const socket = getSocket();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!clientId) return;

    socket.emit('join-client-room', clientId);

    const events = Object.keys(handlersRef.current);
    events.forEach((event) => {
      socket.on(event, (data) => handlersRef.current[event]?.(data));
    });

    return () => {
      events.forEach((event) => socket.off(event));
    };
  }, [clientId, socket]);

  return socket;
};
