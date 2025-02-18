'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { User, UserRole } from '@/types/user';
import { toast } from 'react-hot-toast';
import UserBadge from '@/components/UserBadge';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import PasswordResetButton from '@/components/admin/PasswordResetButton';

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

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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
  const [sortField, setSortField] = useState<keyof User>('created_at');
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

      const formattedUsers = data?.map(profile => ({
        id: profile.id,
        email: profile.email,
        roles: profile.roles || ['PARTICIPANT'],
        display_name: profile.display_name,
        created_at: profile.created_at,
        post_count: profile.post_count
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
        const aVal = a[sortField];
        const bVal = b[sortField];
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
  const exportUsers = async (format: ExportFormat = 'csv') => {
    const filteredUsers = getSortedAndFilteredUsers();
    let blob: Blob;
    let filename: string;

    if (format === 'xlsx') {
      // Dynamically import XLSX only when needed
      const XLSX = (await import('xlsx-js-style')).default;
      const data = filteredUsers.map(user => ({
        Email: user.email,
        'Display Name': user.display_name,
        Roles: user.roles.join(', '),
        'Created At': formatDate(user.created_at)
      }));
      const ws = XLSX.utils.aoa_to_sheet([
        Object.keys(data[0]), // Headers
        ...data.map(obj => Object.values(obj)) // Data rows
      ]);
      const wb = { Sheets: { Users: ws }, SheetNames: ['Users'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      filename = `users-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (format === 'csv') {
      const csv = [
        ['Email', 'Display Name', 'Roles', 'Post Count', 'Created At'],
        ...filteredUsers.map(user => [
          user.email,
          user.display_name,
          user.roles.join(', '),
          user.post_count.toString(),
          formatDate(user.created_at)
        ])
      ].map(row => row.join(',')).join('\n');

      blob = new Blob([csv], { type: 'text/csv' });
      filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      const data = filteredUsers.map(user => ({
        ...user,
        created_at: formatDate(user.created_at)
      }));
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Create User
        </button>
      </div>

      {/* Search, Filter, and Bulk Actions */}
      <div className="mb-4 space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
            className="form-select"
          >
            <option value="ALL">All Roles</option>
            <option value="PARTICIPANT">Participants</option>
            <option value="EXPERT">Experts</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-4">
          <select
            disabled={selectedUsers.length === 0}
            onChange={(e) => handleBulkAction(e.target.value)}
            className="form-select"
            value=""
          >
            <option value="">Bulk Actions</option>
            <option value="delete">Delete Selected</option>
            <option value="role_PARTICIPANT">Make Participants</option>
            <option value="role_EXPERT">Make Experts</option>
            <option value="role_ADMIN">Make Admins</option>
          </select>
          <span className="text-sm text-gray-600">
            {selectedUsers.length} users selected
          </span>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label className="block text-sm font-medium mb-1">Posts Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPosts}
              onChange={e => setFilters(f => ({ ...f, minPosts: e.target.value }))}
              className="form-input w-24"
            />
            <span className="self-center">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPosts}
              onChange={e => setFilters(f => ({ ...f, maxPosts: e.target.value }))}
              className="form-input w-24"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date Range</label>
          <div className="flex space-x-2">
            <select
              onChange={(e) => applyDateRangePreset(e.target.value as DateRangePreset)}
              className="form-select"
              value="custom"
            >
              <option value="custom">Custom Range</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 w-8">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setSelectedUsers(e.target.checked ? users.map(u => u.id) : []);
                  }}
                  checked={selectedUsers.length === users.length}
                  className="form-checkbox"
                />
              </th>
              {/* Sortable Headers */}
              {['email', 'display_name', 'post_count', 'created_at'].map((field) => (
                <th
                  key={field}
                  className="px-6 py-3 text-left cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    if (sortField === field) {
                      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field as keyof User);
                      setSortDirection('asc');
                    }
                  }}
                >
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedAndFilteredUsers()
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map(user => (
                <tr key={user.id} className="border-b">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        setSelectedUsers(prev =>
                          e.target.checked
                            ? [...prev, user.id]
                            : prev.filter(id => id !== user.id)
                        );
                      }}
                      className="form-checkbox"
                    />
                  </td>
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
                  <td className="px-6 py-4">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 space-x-2">
                    <select
                      value={user.roles[0]}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      className="form-select"
                    >
                      <option value="PARTICIPANT">Participant</option>
                      <option value="EXPERT">Expert</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                    <PasswordResetButton userId={user.id} userEmail={user.email} />
                  </td>
                </tr>
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

      {/* Update the export button to a dropdown */}
      <div className="relative inline-block">
        <button
          onClick={() => {
            const menu = document.getElementById('export-menu');
            menu?.classList.toggle('hidden');
          }}
          className="px-3 py-1 text-primary border border-primary rounded hover:bg-primary/10"
        >
          Export ▼
        </button>
        <div
          id="export-menu"
          className="hidden absolute right-0 mt-1 bg-white border rounded shadow-lg py-1 z-10"
        >
          <button
            onClick={() => exportUsers('csv')}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Export as CSV
          </button>
          <button
            onClick={() => exportUsers('xlsx')}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Export as Excel
          </button>
          <button
            onClick={() => exportUsers('json')}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Export as JSON
          </button>
        </div>
      </div>

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