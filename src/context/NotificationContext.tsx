import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Notification } from '@/types';
import api from '@/lib/api';
import notificationSound from '@/utils/notificationSound';
import { notificationTemplates } from '@/utils/notificationTemplates';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [socket, setSocket] = React.useState<WebSocket | null>(null);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [soundVolume, setSoundVolume] = React.useState(0.5);

  React.useEffect(() => {
    notificationSound.setVolume(soundVolume);
  }, [soundVolume]);

  React.useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Set up WebSocket connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onmessage = (event) => {
      const newNotification: Notification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);

      if (soundEnabled) {
        notificationSound.play();
      }

      // Show desktop notification if enabled
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icons/notification-icon.png',
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [soundEnabled]);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearNotification = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const showSuccess = (message: string) => toast.success(message);
  const showError = (message: string) => toast.error(message);

  const playNotificationSound = () => {
    if (!notificationSound) return;
    if (soundEnabled) {
      notificationSound.play();
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      soundEnabled,
      setSoundEnabled,
      soundVolume,
      setSoundVolume,
      showSuccess,
      showError,
    }}>
      {children}
      <Toaster position="top-right" />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 