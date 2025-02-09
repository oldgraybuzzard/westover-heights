import React from 'react';
import { NotificationPreferences as Preferences } from '@/types';
import api from '@/lib/api';

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = React.useState<Preferences>({
    email: {
      newQuestions: true,
      followUps: true,
      systemUpdates: false,
    },
    push: {
      newQuestions: true,
      followUps: true,
      systemUpdates: false,
    },
    desktop: {
      enabled: false,
      newQuestions: true,
      followUps: true,
      systemUpdates: false,
    },
  });

  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.get('/api/notifications/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const handleChange = async (
    channel: keyof Preferences,
    type: string,
    value: boolean
  ) => {
    const newPreferences = {
      ...preferences,
      [channel]: {
        ...preferences[channel],
        [type]: value,
      },
    };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      await api.put('/api/notifications/preferences', newPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const requestDesktopPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      handleChange('desktop', 'enabled', true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Choose how you want to receive notifications
        </p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
        {Object.entries(preferences.email).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm text-gray-700">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange('email', key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ))}
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
        {Object.entries(preferences.push).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm text-gray-700">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange('push', key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ))}
      </div>

      {/* Desktop Notifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Desktop Notifications</h4>
          {!preferences.desktop.enabled && (
            <button
              onClick={requestDesktopPermission}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Enable
            </button>
          )}
        </div>
        {preferences.desktop.enabled && (
          <>
            {Object.entries(preferences.desktop).map(([key, value]) => (
              key !== 'enabled' && (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleChange('desktop', key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              )
            ))}
          </>
        )}
      </div>

      {saving && (
        <p className="text-sm text-gray-500">Saving preferences...</p>
      )}
    </div>
  );
};

export default NotificationPreferences; 