import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadData = async () => {
    if (!user) return;
    setIsDownloading(true);

    try {
      // Fetch user's data
      const [profileData, topicsData, repliesData, paymentsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('topics').select('*').eq('author_id', user.id),
        supabase.from('replies').select('*').eq('author_id', user.id),
        supabase.from('payment_history').select('*').eq('user_id', user.id)
      ]);

      // Create CSV content
      const csvContent = [
        // Profile section
        ['Profile Information'],
        ['ID', 'Display Name', 'Email Visible', 'Roles', 'Created At'],
        [
          profileData.data.id,
          profileData.data.display_name,
          profileData.data.email_visible,
          profileData.data.roles?.join(';'),
          profileData.data.created_at
        ],
        [''], // Empty line for separation

        // Topics section
        ['Topics'],
        ['ID', 'Title', 'Content', 'Category', 'Status', 'Created At'],
        ...(topicsData.data || []).map(topic => [
          topic.id,
          topic.title,
          topic.content,
          topic.category,
          topic.status,
          topic.created_at
        ]),
        [''],

        // Replies section
        ['Replies'],
        ['ID', 'Topic ID', 'Content', 'Created At'],
        ...(repliesData.data || []).map(reply => [
          reply.id,
          reply.topic_id,
          reply.content,
          reply.created_at
        ]),
        [''],

        // Payments section
        ['Payment History'],
        ['ID', 'Amount', 'Status', 'Payment Intent ID', 'Posts Remaining', 'Created At'],
        ...(paymentsData.data || []).map(payment => [
          payment.id,
          (payment.amount / 100).toFixed(2),
          payment.status,
          payment.payment_intent_id,
          payment.posts_remaining,
          payment.created_at
        ])
      ]
        .map(row => row.map(cell =>
          // Escape cells containing commas, quotes, or newlines
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        ).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account-data-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Your data has been downloaded');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Failed to download data');
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) {
        throw new Error('No active session found');
      }

      // Call our API endpoint to delete the account
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      await signOut();
      router.push('/');
      toast.success('Your account has been deleted');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/forum" className="text-gray-600 hover:text-primary flex items-center gap-2">
          <FaArrowLeft /> Back to Forum
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* Password Change Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <PasswordChangeForm />
        </div>

        {/* Download Data Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Download Your Data</h2>
              <p className="text-gray-600 mt-1">
                Get a copy of all your personal data, including topics, replies, and payment history.
              </p>
            </div>
            <button
              onClick={downloadData}
              disabled={isDownloading}
              className="btn-secondary flex items-center gap-2"
            >
              <FaDownload />
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-red-600">Delete Account</h2>
              <p className="text-gray-600 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={deleteAccount}
              disabled={isDeleting}
              className="btn-danger flex items-center gap-2"
            >
              <FaTrash />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
