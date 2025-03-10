'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { UserRole } from '@/types/user';
import { toast } from 'react-hot-toast';
import UserBadge from '@/components/UserBadge';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import PasswordResetButton from '@/components/admin/PasswordResetButton';
import PaymentHistory from '@/components/admin/PaymentHistory';
import React from 'react';
import { FaFileExport, FaCalendar, FaFilter } from 'react-icons/fa';

interface Profile {
  id: string;
  display_name: string;
  roles: UserRole[];
  created_at: string;
  email: string;
  post_count: number;
}

interface CreateUserForm {
  email: string;
  password: string;
  roles: UserRole[];
  display_name: string;
}

interface EditUserForm {
  display_name: string;
  id: string;
}

interface FilterPreset {
  name: string;
  filters: {
    minPosts?: string;
    maxPosts?: string;
    dateFrom?: string;
    dateTo?: string;
    roleFilter?: UserRole | 'ALL';
    search?: string;
  };
  isCustom?: boolean;
}

type ExportFormat = 'csv' | 'json' | 'xlsx';
type DateRangePreset = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

interface EditPresetForm {
  name: string;
  filters: FilterPreset['filters'];
  originalName: string;
}

// Add formatDate helper
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
};

interface UserWithPosts {
  id: string;
  email: string;
  roles: string[];
  display_name: string;
  post_count: number;
  created_at: string;
  remaining_posts?: number;
}

// Add these helper functions before the AdminUsersPage component
const convertToCSV = (users: UserWithPosts[]) => {
  const headers = ['Email', 'Display Name', 'Roles', 'Post Count', 'Remaining Posts', 'Created At'];
  const rows = users.map(user => [
    user.email,
    user.display_name,
    user.roles.join(', '),
    user.post_count.toString(),
    user.remaining_posts?.toString() || '0',
    formatDate(user.created_at)
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const convertToExcel = async (users: UserWithPosts[]) => {
  const XLSX = (await import('xlsx-js-style')).default;
  const data = users.map(user => ({
    Email: user.email,
    'Display Name': user.display_name,
    Roles: user.roles.join(', '),
    'Post Count': user.post_count,
    'Remaining Posts': user.remaining_posts || 0,
    'Created At': formatDate(user.created_at)
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

const downloadFile = (content: string | Buffer, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function AdminUsersPage() {
  const { isAdmin, isExpert } = useAuth();
  const [users, setUsers] = useState<UserWithPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    roles: ['PARTICIPANT'],
    display_name: ''
  });
  const [editForm, setEditForm] = useState<EditUserForm | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<keyof UserWithPosts>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 10;
  const [filters, setFilters] = useState({
    minPosts: '',
    maxPosts: '',
    dateFrom: '',
    dateTo: ''
  });
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);
  const [showEditPresetModal, setShowEditPresetModal] = useState(false);
  const [editPresetForm, setEditPresetForm] = useState<EditPresetForm | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const dateRangePresets: Record<DateRangePreset, { from: Date; to: Date }> = {
    today: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date()
    },
    thisWeek: {
      from: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
      to: new Date()
    },
    thisMonth: {
      from: new Date(new Date().setDate(1)),
      to: new Date()
    },
    thisYear: {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date()
    },
    custom: {
      from: new Date(),
      to: new Date()
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_users_with_stats')
        .returns<Profile[]>();

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
        return;
      }

      const formattedUsers = data?.map(user => ({
        ...user,
        remaining_posts: 0
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      router.push('/unauthorized');
    }
  }, [isAdmin, router]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole.toUpperCase() })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user role');
      return;
    }

    setUsers(users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    ));
    toast.success('User role updated successfully');
  };

  // Add create user function
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: createForm.email,
        password: createForm.password,
        email_confirm: true
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          roles: createForm.roles,
          display_name: createForm.display_name
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success('User created successfully');
      setShowCreateModal(false);
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  // Add delete user function
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Add edit function
  const updateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: editForm.display_name })
        .eq('id', editForm.id);

      if (error) throw error;

      setUsers(users.map(u =>
        u.id === editForm.id ? { ...u, display_name: editForm.display_name } : u
      ));
      setEditForm(null);
      toast.success('Display name updated');
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name');
    }
  };

  // Add sorting function
  const getSortedAndFilteredUsers = () => {
    return users
      .filter(user => {
        // Basic filters
        const matchesSearch =
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.display_name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter);

        // Advanced filters
        const matchesPostCount =
          (!filters.minPosts || user.post_count >= Number(filters.minPosts)) &&
          (!filters.maxPosts || user.post_count <= Number(filters.maxPosts));

        const matchesDate =
          (!filters.dateFrom || new Date(user.created_at) >= new Date(filters.dateFrom)) &&
          (!filters.dateTo || new Date(user.created_at) <= new Date(filters.dateTo));

        return matchesSearch && matchesRole && matchesPostCount && matchesDate;
      })
      .sort((a, b) => {
        const aVal = a[sortField] ?? '';
        const bVal = b[sortField] ?? '';
        const modifier = sortDirection === 'asc' ? 1 : -1;
        return aVal < bVal ? -1 * modifier : 1 * modifier;
      });
  };

  // Add bulk actions handler
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`Delete ${selectedUsers.length} users?`)) return;

      try {
        for (const userId of selectedUsers) {
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (error) throw error;
        }
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
        toast.success('Users deleted successfully');
      } catch (error) {
        console.error('Error deleting users:', error);
        toast.error('Failed to delete users');
      }
    } else if (action.startsWith('role_')) {
      const newRole = action.replace('role_', '') as UserRole;
      if (!confirm(`Update ${selectedUsers.length} users to ${newRole}?`)) return;

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ roles: [newRole] })
          .in('id', selectedUsers);

        if (error) throw error;

        setUsers(users.map(user =>
          selectedUsers.includes(user.id)
            ? { ...user, roles: [newRole] }
            : user
        ));
        setSelectedUsers([]);
        toast.success('Users updated successfully');
      } catch (error) {
        console.error('Error updating users:', error);
        toast.error('Failed to update users');
      }
    }
  };

  // Add export function
  const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
    const filteredUsers = getSortedAndFilteredUsers();

    switch (format) {
      case 'csv':
        // Export as CSV
        const csvContent = convertToCSV(filteredUsers);
        downloadFile(csvContent, `users-export.csv`, 'text/csv');
        break;
      case 'xlsx':
        // Export as Excel
        const excelBuffer = await convertToExcel(filteredUsers);
        downloadFile(excelBuffer, `users-export.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;
      case 'json':
        // Export as JSON
        const jsonContent = JSON.stringify(filteredUsers, null, 2);
        downloadFile(jsonContent, `users-export.json`, 'application/json');
        break;
    }
  };

  // Add date range preset handler
  const applyDateRangePreset = (preset: DateRangePreset) => {
    if (preset === 'custom') return;

    const { from, to } = dateRangePresets[preset];
    setFilters(f => ({
      ...f,
      dateFrom: from.toISOString().split('T')[0],
      dateTo: to.toISOString().split('T')[0]
    }));
  };

  // Add preset management
  const deletePreset = (presetName: string) => {
    if (!confirm(`Delete preset "${presetName}"?`)) return;

    const updatedPresets = customPresets.filter(p => p.name !== presetName);
    setCustomPresets(updatedPresets);
    localStorage.setItem('userFilterPresets', JSON.stringify(updatedPresets));
    toast.success('Preset deleted');
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if no input/textarea is focused
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const menu = document.getElementById('export-menu');
        menu?.classList.toggle('hidden');
      }

      // Ctrl/Cmd + F for focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }

      // Ctrl/Cmd + N for new user
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Add preset editing functionality
  const editPreset = (preset: FilterPreset) => {
    setEditPresetForm({
      name: preset.name,
      filters: { ...preset.filters },
      originalName: preset.name
    });
    setShowEditPresetModal(true);
  };

  const handleEditPresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPresetForm) return;

    const updatedPresets = customPresets.map(p =>
      p.name === editPresetForm.originalName
        ? { name: editPresetForm.name, filters: editPresetForm.filters, isCustom: true }
        : p
    );

    setCustomPresets(updatedPresets);
    localStorage.setItem('userFilterPresets', JSON.stringify(updatedPresets));
    setShowEditPresetModal(false);
    setEditPresetForm(null);
    toast.success('Preset updated successfully');
  };

  // Add this useEffect to handle localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userFilterPresets');
    if (saved) {
      setCustomPresets(JSON.parse(saved));
    }
  }, []);

  const grantAdditionalPosts = async (userId: string, amount: number = 1) => {
    try {
      const { data, error } = await supabase.rpc('increment_remaining_posts', {
        user_id: userId,
        increment_amount: amount
      });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            remaining_posts: (user.remaining_posts || 0) + amount
          };
        }
        return user;
      }));

      toast.success('Additional posts granted successfully');
    } catch (error) {
      toast.error('Failed to grant additional posts');
      console.error('Error granting posts:', error);
    }
  };

  // Add a tooltip component for the buttons
  const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {text}
      </div>
    </div>
  );

  const ExportSection = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaFileExport className="text-primary" />
            Export Users Data
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Date Range Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCalendar className="text-gray-400" />
              Date Range
            </label>
            <select
              className="form-select w-full"
              onChange={(e) => {
                const preset = e.target.value as DateRangePreset;
                if (preset !== 'custom') {
                  setFilters({
                    ...filters,
                    dateFrom: dateRangePresets[preset].from.toISOString().split('T')[0],
                    dateTo: dateRangePresets[preset].to.toISOString().split('T')[0]
                  });
                }
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Custom Date Range Inputs */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="form-input text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="form-input text-sm"
                placeholder="To"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              Filters
            </label>
            <div className="space-y-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                className="form-select w-full"
              >
                <option value="ALL">All Roles</option>
                <option value="PARTICIPANT">Participants</option>
                <option value="EXPERT">Experts</option>
                <option value="ADMIN">Admins</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPosts}
                  onChange={(e) => setFilters({ ...filters, minPosts: e.target.value })}
                  className="form-input text-sm"
                  placeholder="Min Posts"
                />
                <input
                  type="number"
                  value={filters.maxPosts}
                  onChange={(e) => setFilters({ ...filters, maxPosts: e.target.value })}
                  className="form-input text-sm"
                  placeholder="Max Posts"
                />
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Export Format</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="btn-secondary flex items-center justify-center gap-2 py-2"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="btn-secondary flex items-center justify-center gap-2 py-2"
              >
                Export as Excel
              </button>
              <button
                onClick={() => handleExport('json')}
                className="btn-secondary flex items-center justify-center gap-2 py-2"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-[95%] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <ExportSection />

      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Display Name
              </th>
              <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="w-[8%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posts
              </th>
              <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="w-[30%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedAndFilteredUsers()
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((user) => (
                <React.Fragment key={user.id}>
                  <tr>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {editForm?.id === user.id ? (
                        <form onSubmit={updateDisplayName} className="flex space-x-2">
                          <input
                            type="text"
                            value={editForm.display_name}
                            onChange={e => setEditForm({ ...editForm, display_name: e.target.value })}
                            className="form-input w-32"
                            required
                          />
                          <button
                            type="submit"
                            className="text-primary hover:text-primary/80"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{user.display_name}</span>
                          <button
                            onClick={() => setEditForm({ id: user.id, display_name: user.display_name })}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{user.roles.join(', ')}</td>
                    <td className="px-6 py-4">{user.post_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {user.remaining_posts || 0}
                        </span>
                        {(isExpert() || isAdmin()) && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => grantAdditionalPosts(user.id, 1)}
                              className="p-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                              title="Grant 1 post"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => grantAdditionalPosts(user.id, 3)}
                              className="p-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                              title="Grant 3 posts"
                            >
                              +3
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <select
                          value={user.roles[0]}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          className="form-select text-sm min-w-[120px]"
                        >
                          <option value="PARTICIPANT">Participant</option>
                          <option value="EXPERT">Expert</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                            className="text-primary hover:text-primary-dark text-sm whitespace-nowrap"
                          >
                            {selectedUserId === user.id ? 'Hide History' : 'View $ History'}
                          </button>

                          <PasswordResetButton userId={user.id} userEmail={user.email} />

                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 text-sm whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {selectedUserId === user.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <PaymentHistory
                          userId={user.id}
                          onUpdate={fetchUsers}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, users.length)} of {users.length} users
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage * ITEMS_PER_PAGE >= users.length}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={createForm.display_name}
                  onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={createForm.roles[0]}
                  onChange={e => setCreateForm({ ...createForm, roles: [e.target.value as UserRole] })}
                  className="form-select w-full"
                >
                  <option value="PARTICIPANT">Participant</option>
                  <option value="EXPERT">Expert</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update the presets dropdown to include edit buttons */}
      <div className="relative">
        <select
          onChange={(e) => {
            if (e.target.value) {
              const preset = [...customPresets].find(p => p.name === e.target.value);
              if (preset) applyDateRangePreset(e.target.value as DateRangePreset);
              e.target.value = '';
            }
          }}
          className="form-select"
          defaultValue=""
        >
          <option value="" disabled>Apply Preset</option>
          {customPresets.map(preset => (
            <div key={preset.name} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
              <option value={preset.name}>{preset.name}</option>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editPreset(preset);
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deletePreset(preset.name);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </select>
      </div>

      {/* Edit Preset Modal */}
      {showEditPresetModal && editPresetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Preset</h3>
            <form onSubmit={handleEditPresetSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preset Name</label>
                  <input
                    type="text"
                    value={editPresetForm.name}
                    onChange={e => setEditPresetForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="form-input w-full"
                    required
                  />
                </div>
                {/* Add filter fields */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditPresetModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 