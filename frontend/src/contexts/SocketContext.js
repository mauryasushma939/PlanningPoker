import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('Environment variables:', {
  REACT_APP_SOCKET_URL: process.env.REACT_APP_SOCKET_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  SOCKET_URL,
  API_URL
});

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('🔌 Initializing Socket.IO connection...');
    console.log('SOCKET_URL:', SOCKET_URL);
    console.log('API_URL:', API_URL);

    const t0 = performance.now();
    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 4000,
      reconnectionAttempts: 5,
      timeout: 8000, // fail fast if endpoint/cors/proxy is wrong
      withCredentials: false,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      const dt = Math.round(performance.now() - t0);
      console.log(`Connected to server in ${dt}ms`);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
