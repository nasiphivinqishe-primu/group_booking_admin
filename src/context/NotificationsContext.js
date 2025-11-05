import React, { createContext, useContext, useEffect, useState } from 'react';

const NotificationsContext = createContext();
export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('wss://nmabovavh6.execute-api.eu-west-1.amazonaws.com/dev/');

    ws.onopen = () => {
      console.log('✅ Connected to WebSocket');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onclose = () => console.warn('🔌 WebSocket closed');
    ws.onerror = (err) => console.error('❌ WebSocket error', err);

    return () => ws.close();
  }, []);

  const sendMessage = (payload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'sendMessage', payload }));
    }
  };

  const markAllAsRead = () => setUnreadCount(0);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, sendMessage }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
