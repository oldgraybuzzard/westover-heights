import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck, FaExclamation, FaTimes } from 'react-icons/fa';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  showNotification: (type: string, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => { },
  markAllAsRead: () => { },
  clearNotification: () => { },
  showNotification: () => { },
  showSuccess: () => { },
  showError: () => { },
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, message, read: false, createdAt: new Date().toISOString() }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      showNotification,
      showSuccess: () => { },
      showError: () => { },
    }}>
      {children}
      <NotificationList
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

function NotificationList({
  notifications,
  removeNotification
}: {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' :
              notification.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
          >
            {notification.type === 'success' && <FaCheck className="w-5 h-5" />}
            {notification.type === 'error' && <FaExclamation className="w-5 h-5" />}
            <p className="pr-8">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 