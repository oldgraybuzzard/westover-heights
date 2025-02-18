'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Message } from '@/types/expert';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface MessageWithUser extends Message {
  sender: {
    display_name: string;
  };
  recipient: {
    display_name: string;
  };
}

export default function Messages() {
  const { user, isExpert } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    content: ''
  });
  const [searchUsers, setSearchUsers] = useState('');
  const [userResults, setUserResults] = useState<{ id: string; display_name: string; }[]>([]);

  useEffect(() => {
    if (!isExpert()) {
      router.push('/unauthorized');
      return;
    }
    fetchMessages();
  }, [isExpert]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(display_name),
          recipient:profiles!messages_recipient_id_fkey(display_name)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const searchForUsers = async (query: string) => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .ilike('display_name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setUserResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.recipient_id || !newMessage.subject.trim() || !newMessage.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: newMessage.recipient_id,
          subject: newMessage.subject,
          content: newMessage.content
        });

      if (error) throw error;

      toast.success('Message sent successfully');
      setShowComposeModal(false);
      setNewMessage({ recipient_id: '', subject: '', content: '' });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowComposeModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Compose Message
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No messages yet</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map(message => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 ${!message.read && message.recipient_id === user?.id ? 'bg-blue-50' : ''}`}
                onClick={() => !message.read && markAsRead(message.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{message.subject}</h3>
                    <div className="text-sm text-gray-500">
                      From: {message.sender.display_name} • To: {message.recipient.display_name}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-gray-700">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="text"
                  value={searchUsers}
                  onChange={(e) => {
                    setSearchUsers(e.target.value);
                    searchForUsers(e.target.value);
                  }}
                  className="w-full p-2 border rounded"
                  placeholder="Search for user..."
                />
                {userResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
                    {userResults.map(user => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setNewMessage(prev => ({ ...prev, recipient_id: user.id }));
                          setSearchUsers(user.display_name);
                          setUserResults([]);
                        }}
                      >
                        {user.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-32 p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 