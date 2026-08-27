import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Link2,
  MousePointerClick,
  Activity,
  Search,
  Trash2,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Database,
  Server,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { URLItem, User, HealthReport } from '../types';
import { copyToClipboard, formatRelativeTime } from '../utils/formatters';
import { StatsCard } from '../components/StatsCard';
import { QRCodeModal } from '../components/QRCodeModal';
import { ClicksDetailModal } from '../components/ClicksDetailModal';

export const AdminDashboardPage: React.FC = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'urls' | 'users' | 'health'>('urls');
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<HealthReport | null>(null);

  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  const [deletingUrlId, setDeletingUrlId] = useState<number | null>(null);
  const [deletingUserEmail, setDeletingUserEmail] = useState<string | null>(null);

  const [urlSearch, setUrlSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modals
  const [selectedQrUrl, setSelectedQrUrl] = useState<URLItem | null>(null);
  const [selectedClicksUrl, setSelectedClicksUrl] = useState<URLItem | null>(null);

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

  const fetchHealth = async () => {
    try {
      setIsLoadingHealth(true);
      const report = await api.getHealth();
      setHealth(report);
    } catch {
      setHealth({ status: 'Unhealthy / Offline' });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchAllUrls();
    fetchAllUsers();
    fetchHealth();
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
            System-wide administration, global link repository, user accounts, and diagnostics.
          </p>
        </div>

        <button
          onClick={() => {
            fetchAllUrls();
            fetchAllUsers();
            fetchHealth();
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
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
        <StatsCard
          title="System Health"
          value={health?.status || 'Active'}
          subtitle="PostgreSQL Connected"
          icon={Activity}
          iconColor="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-950/50"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('urls')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
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
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'health'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Diagnostics & Health</span>
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
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100"
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
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              title="QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUrl(url.id)}
                              disabled={deletingUrlId === url.id}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
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
                Registered platform accounts and administrative roles
              </p>
            </div>

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
                          <button
                            onClick={() => handleDeleteUser(u.email)}
                            disabled={deletingUserEmail === u.email}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 disabled:opacity-50"
                            title="Delete User"
                          >
                            {deletingUserEmail === u.email ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
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

      {/* Tab 3: Diagnostics */}
      {activeTab === 'health' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live System Diagnostics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time health report queried from the ASP.NET Core `/health` endpoint
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={isLoadingHealth}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
              <span>Ping Now</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                <Server className="w-4 h-4 text-blue-500" />
                <span>Web Application Liveness</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status:{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {health?.status || 'Unknown'}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Description: {health?.results?.healthcheck?.description || 'Service is healthy'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>PostgreSQL Database Connectivity</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status:{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {health?.results?.npgsql?.status || (health?.status === 'Healthy' ? 'Healthy' : 'N/A')}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Driver: Npgsql EntityFrameworkCore Provider (v10.0.3)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Raw Health Response
            </h4>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(health, null, 2)}
            </pre>
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
