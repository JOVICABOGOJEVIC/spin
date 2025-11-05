import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.result) {
      // Initialize socket connection
      const socketURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const newSocket = io(socketURL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 WebSocket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join room based on user type
        const userType = user.result.userType || 'worker';
        const businessType = user.result.businessType || 'Home Appliance Technician';
        const userId = user.result._id;
        
        newSocket.emit('join_room', {
          userType,
          userId,
          businessType
        });
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 WebSocket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Closing WebSocket connection');
        newSocket.close();
      };
    }
  }, [user]);

  const emitJobStatusUpdate = (jobData) => {
    if (socket && isConnected) {
      const userType = user?.result?.userType || 'worker';
      const businessType = user?.result?.businessType || 'Home Appliance Technician';
      
      socket.emit('job_status_update', {
        ...jobData,
        userType,
        businessType,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitWorkerStatusUpdate = (workerData) => {
    if (socket && isConnected) {
      const businessType = user?.result?.businessType || 'Home Appliance Technician';
      
      socket.emit('worker_status_update', {
        ...workerData,
        businessType,
        timestamp: new Date().toISOString()
      });
    }
  };

  const value = {
    socket,
    isConnected,
    emitJobStatusUpdate,
    emitWorkerStatusUpdate
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
