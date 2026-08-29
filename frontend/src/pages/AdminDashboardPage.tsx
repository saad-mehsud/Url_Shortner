import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Link2,
  MousePointerClick,
  Search,
  Trash2,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Edit2,
  UserPlus,
  X,
  Save,
  Shield,
  Mail,
  User as UserIcon,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { URLItem, User } from '../types';
import { copyToClipboard, formatRelativeTime } from '../utils/formatters';
import { StatsCard } from '../components/StatsCard';
import { QRCodeModal } from '../components/QRCodeModal';
import { ClicksDetailModal } from '../components/ClicksDetailModal';

export const AdminDashboardPage: React.FC = () => {
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'urls' | 'users'>('urls');
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [deletingUrlId, setDeletingUrlId] = useState<number | null>(null);
  const [deletingUserEmail, setDeletingUserEmail] = useState<string | null>(null);

  const [urlSearch, setUrlSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modals
  const [selectedQrUrl, setSelectedQrUrl] = useState<URLItem | null>(null);
  const [selectedClicksUrl, setSelectedClicksUrl] = useState<URLItem | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'User' | 'Admin'>('User');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Create User State (Admin creating a user/admin)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'User' | 'Admin'>('User');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const fetchAllUrls = async () => {
    try {
      setIsLoadingUrls(true);
      const res = await api.getAllUrls();
      setUrls(Array.isArray(res) ? res : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not fetch system URLs';
      error('Admin URL Fetch Error', msg);
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await api.getAllUsers();
      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not fetch users';
      error('Admin User Fetch Error', msg);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAllUrls();
    fetchAllUsers();
  }, []);

  const handleDeleteUrl = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete URL #${id}?`)) return;

    try {
      setDeletingUrlId(id);
      await api.deleteUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      success('Deleted', `URL #${id} removed from system.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete URL.';
      error('Delete Error', msg);
    } finally {
      setDeletingUrlId(null);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${email}"? This will cascade-delete all their URLs and refresh tokens.`
      )
    )
      return;

    try {
      setDeletingUserEmail(email);
      await api.deleteUser(email);
      setUsers((prev) => prev.filter((u) => u.email !== email));
      // Refresh URLs as cascade deletion might have removed user's URLs
      fetchAllUrls();
      success('User Deleted', `User ${email} and all their data were removed.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete user.';
      error('Delete Error', msg);
    } finally {
      setDeletingUserEmail(null);
    }
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserName(user.userName);
    setEditEmail(user.email);
    setEditRole((user.role === 'Admin' ? 'Admin' : 'User'));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editUserName.trim() || !editEmail.trim()) {
      warning('Required Fields', 'Username and email cannot be empty.');
      return;
    }

    try {
      setIsSavingUser(true);
      await api.updateUser({
        id: editingUser.id,
        userName: editUserName.trim(),
        email: editEmail.trim(),
        role: editRole,
      });

      // Update in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, userName: editUserName.trim(), email: editEmail.trim(), role: editRole }
            : u
        )
      );

      success('User Updated', `User "${editUserName}" profile and role were updated.`);
      setEditingUser(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update user.';
      error('Update Error', msg);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName.trim() || !newEmail.trim() || !newPassword.trim()) {
      warning('Required Fields', 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      warning('Short Password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsCreatingUser(true);
      const created = await api.register({
        userName: newUserName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      });

      setUsers((prev) => [...prev, created]);
      success('User Created', `New account "${newUserName}" (${newRole}) created successfully.`);
      setIsCreateUserModalOpen(false);
      setNewUserName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('User');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create user.';
      error('Creation Error', msg);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCopy = async (id: number, shortUrl: string) => {
    const ok = await copyToClipboard(shortUrl);
    if (ok) {
      setCopiedId(id);
      success('Copied!', 'Short URL copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtered URLs
  const filteredUrls = useMemo(() => {
    if (!urlSearch.trim()) return urls;
    const q = urlSearch.toLowerCase();
    return urls.filter(
      (u) =>
        u.shortUrl?.toLowerCase().includes(q) ||
        u.longUrl?.toLowerCase().includes(q) ||
        u.userId?.toString().includes(q) ||
        u.id.toString().includes(q)
    );
  }, [urls, urlSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.userName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.id.toString().includes(q)
    );
  }, [users, userSearch]);

  const totalGlobalClicks = useMemo(() => {
    return urls.reduce((acc, curr) => acc + (curr.clicks?.length || 0), 0);
  }, [urls]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Administrator Console
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System-wide administration, global link repository, and user accounts.
          </p>
        </div>

        <button
          onClick={() => {
            fetchAllUrls();
            fetchAllUsers();
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="System URLs"
          value={urls.length}
          subtitle="All created links"
          icon={Link2}
          iconColor="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-950/50"
        />
        <StatsCard
          title="Registered Users"
          value={users.length}
          subtitle="Accounts in database"
          icon={Users}
          iconColor="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-50 dark:bg-purple-950/50"
        />
        <StatsCard
          title="Global Clicks"
          value={totalGlobalClicks}
          subtitle="Total redirects logged"
          icon={MousePointerClick}
          iconColor="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-50 dark:bg-indigo-950/50"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('urls')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'urls'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>All System URLs ({urls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: URLs Management */}
      {activeTab === 'urls' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Global Short Links
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displaying all URLs shortened across the entire platform
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={urlSearch}
                onChange={(e) => setUrlSearch(e.target.value)}
                placeholder="Search by URL or User ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {isLoadingUrls ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs font-medium text-slate-500">Loading system URLs...</p>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No URLs found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Short URL</th>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">User ID</th>
                    <th className="pb-3 pr-4">Clicks</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredUrls.map((url) => {
                    const clickCount = url.clicks?.length || 0;
                    return (
                      <tr key={url.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 pr-4 text-slate-400 font-mono">#{url.id}</td>
                        <td className="py-3.5 pr-4 font-mono font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-600 dark:text-blue-400 truncate max-w-[160px]">
                              {url.shortUrl}
                            </span>
                            <button
                              onClick={() => handleCopy(url.id, url.shortUrl)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Copy"
                            >
                              {copiedId === url.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={url.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-blue-500"
                              title="Open"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 max-w-xs truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]" title={url.longUrl}>
                          {url.longUrl}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-slate-600 dark:text-slate-400">
                          User #{url.userId}
                        </td>
                        <td className="py-3.5 pr-4">
                          <button
                            onClick={() => setSelectedClicksUrl(url)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 cursor-pointer"
                          >
                            <MousePointerClick className="w-3 h-3" />
                            <span>{clickCount}</span>
                          </button>
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {formatRelativeTime(url.createdAt)}
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedQrUrl(url)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                              title="QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUrl(url.id)}
                              disabled={deletingUrlId === url.id}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 disabled:opacity-50 cursor-pointer"
                              title="Delete URL"
                            >
                              {deletingUrlId === url.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                User Accounts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage registered platform accounts, update roles, and manage permissions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, role..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User / Admin</span>
              </button>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
              <p className="text-xs font-medium text-slate-500">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No users matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">User ID</th>
                    <th className="pb-3 pr-4">Username</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredUsers.map((u) => {
                    const isAdminUser = u.role?.toLowerCase() === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 pr-4 text-slate-400 font-mono">#{u.id}</td>
                        <td className="py-3.5 pr-4 font-semibold text-slate-900 dark:text-white">
                          {u.userName}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-slate-600 dark:text-slate-300">
                          {u.email}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAdminUser
                                ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {u.role || 'User'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 cursor-pointer transition-colors"
                              title="Edit user & role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.email)}
                              disabled={deletingUserEmail === u.email}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 disabled:opacity-50 cursor-pointer transition-colors"
                              title="Delete user"
                            >
                              {deletingUserEmail === u.email ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit User #{editingUser.id}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update user details and access role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('User')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      editRole === 'User'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('Admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      editRole === 'Admin'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSavingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal (Admin creation) */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create User / Admin Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add a new platform account with assigned role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="johndoe"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-500" />
                  Assign Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('User')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      newRole === 'User'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('Admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      newRole === 'Admin'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-500/20 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrUrl && (
        <QRCodeModal
          url={selectedQrUrl}
          onClose={() => setSelectedQrUrl(null)}
        />
      )}

      {/* Clicks Breakdown Modal */}
      {selectedClicksUrl && (
        <ClicksDetailModal
          url={selectedClicksUrl}
          onClose={() => setSelectedClicksUrl(null)}
        />
      )}
    </div>
  );
};
