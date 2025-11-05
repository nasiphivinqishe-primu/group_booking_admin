import React from 'react';
import { useNotifications } from '../context/NotificationsContext';
import '../css/Notifications.css';

export default function NotificationsPage() {
  const { notifications, markAllAsRead } = useNotifications();

  React.useEffect(() => {
    markAllAsRead(); 
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul>
          {notifications.map((n, idx) => (
            <li key={idx} className="border-b p-2">
              <p>{n.message}</p>
              {n.timestamp && (
                <span className="text-xs text-gray-400">
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
