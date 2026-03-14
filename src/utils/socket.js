import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
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
