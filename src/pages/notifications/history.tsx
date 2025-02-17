import React from 'react';
import { GetServerSideProps } from 'next';
import { Notification } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/lib/api';

interface NotificationHistoryProps {
  initialNotifications: Notification[];
  totalPages: number;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  initialNotifications,
  totalPages: initialTotalPages,
}) => {
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
  const { markAsRead, clearNotification } = useNotification();

  const loadNotifications = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/notifications/history?page=${page}&filter=${filter}`);
      setNotifications(response.data.notifications);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadNotifications(currentPage);
  }, [currentPage, filter]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleClear = async (id: string) => {
    await clearNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification History</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {notification.title}
                </h3>
                <p className="mt-1 text-gray-600">{notification.message}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => handleClear(notification.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 border rounded-md ${currentPage === i + 1
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await api.get('/api/notifications/history?page=1');
    return {
      props: {
        initialNotifications: response.data.notifications,
        totalPages: response.data.totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return {
      props: {
        initialNotifications: [],
        totalPages: 1,
      },
    };
  }
};

export default NotificationHistory; 