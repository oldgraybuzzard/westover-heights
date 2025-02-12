'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import AdminNav from '@/components/AdminNav';
import { toast } from 'react-hot-toast';

type ActivityLog = {
  id: string;
  user_id: string;
  activity_type: string;
  metadata: any;
  created_at: string;
  user: {
    display_name: string;
  };
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial load of activity logs
    async function loadActivity() {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select(`
            *,
            user:profiles(display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        if (mounted) {
          setLogs(data || []);
        }
      } catch (e) {
        console.error('Error loading activity:', e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('activity_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        async (payload) => {
          // Fetch the complete log with user info
          const { data: newLog } = await supabase
            .from('activity_logs')
            .select(`
              *,
              user:profiles(display_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (newLog) {
            setLogs(currentLogs => [newLog, ...currentLogs.slice(0, 99)]);
            toast.success('New activity logged');
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function formatActivity(log: ActivityLog) {
    const base = `${log.user?.display_name || 'Unknown user'} `;

    switch (log.activity_type) {
      case 'TOPIC_CREATE':
        return `${base} created topic "${log.metadata.title}"`;
      case 'ROLE_CHANGE':
        return `${base} role changed from ${log.metadata.old_role} to ${log.metadata.new_role}`;
      case 'LOGIN':
        return `${base} logged in`;
      case 'REPLY_CREATE':
        return `${base} replied to a topic`;
      default:
        return `${base} performed ${log.activity_type}`;
    }
  }

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Activity Log</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading activity...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {formatActivity(log)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 