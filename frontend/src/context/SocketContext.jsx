import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return;

    try {
      const user = JSON.parse(userStr);
      
      // Initialize socket connection
      const newSocket = io(API_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('🟢 Connected to socket server');
        
        // Setup user identity on server
        newSocket.emit('setup', user);
      });

      newSocket.on('connected', () => {
        console.log('✅ User and socket synced');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('🔴 Disconnected from socket server');
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    } catch (err) {
      console.error('Socket initialization error:', err);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
