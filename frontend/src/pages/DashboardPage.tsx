import React, { useEffect, useState, useMemo } from 'react';
import {
  Link2,
  Plus,
  Search,
  Copy,
  Check,
  QrCode,
  MousePointerClick,
  Trash2,
  ExternalLink,
  Loader2,
  TrendingUp,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { URLItem } from '../types';
import { copyToClipboard, formatDate, formatRelativeTime } from '../utils/formatters';
import { QRCodeModal } from '../components/QRCodeModal';
import { ClicksDetailModal } from '../components/ClicksDetailModal';
import { StatsCard } from '../components/StatsCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [urls, setUrls] = useState<URLItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Form input
  const [inputUrl, setInputUrl] = useState('');

  // Modals
  const [selectedQrUrl, setSelectedQrUrl] = useState<URLItem | null>(null);
  const [selectedClicksUrl, setSelectedClicksUrl] = useState<URLItem | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchUrls = async () => {
    try {
      setIsLoading(true);
      // Attempt fetching user's URLs
      const res = await api.getMyUrls();
      if (Array.isArray(res)) {
        setUrls(res);
      } else if (res && res.id) {
        setUrls([res]);
      } else {
        setUrls([]);
      }
    } catch (err: unknown) {
      // If 404 (no URLs found for user), set empty array
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setUrls([]);
      } else {
        error('Fetch Error', errorMessage || 'Could not load your links.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputUrl.trim()) {
      warning('Empty URL', 'Please enter a valid destination URL.');
      return;
    }

    let urlToSubmit = inputUrl.trim();
    if (!urlToSubmit.startsWith('http://') && !urlToSubmit.startsWith('https://')) {
      urlToSubmit = `https://${urlToSubmit}`;
    }

    try {
      setIsCreating(true);
      const newUrl = await api.createUrl({ url: urlToSubmit });
      setUrls((prev) => [newUrl, ...prev.filter((u) => u.id !== newUrl.id)]);
      setInputUrl('');
      success('Link Created!', 'Short link generated successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create short link.';
      error('Creation Error', msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUrl = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shortened link?')) {
      return;
    }

    try {
      setIsDeletingId(id);
      await api.deleteUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      success('Deleted', 'Short link removed successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete link.';
      error('Delete Error', msg);
    } finally {
      setIsDeletingId(null);
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

  // Filtered URLs based on search query
  const filteredUrls = useMemo(() => {
    if (!searchQuery.trim()) return urls;
    const q = searchQuery.toLowerCase();
    return urls.filter(
      (u) =>
        u.shortUrl?.toLowerCase().includes(q) ||
        u.longUrl?.toLowerCase().includes(q) ||
        u.id.toString().includes(q)
    );
  }, [urls, searchQuery]);

  // Aggregate Metrics
  const totalClicks = useMemo(() => {
    return urls.reduce((acc, curr) => acc + (curr.clicks?.length || 0), 0);
  }, [urls]);

  const topPerformingUrl = useMemo(() => {
    if (urls.length === 0) return null;
    return [...urls].sort((a, b) => (b.clicks?.length || 0) - (a.clicks?.length || 0))[0];
  }, [urls]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.userName}</span>. Manage your shortened links and monitor performance.
          </p>
        </div>
        <button
          onClick={fetchUrls}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          title="Total Links Created"
          value={urls.length}
          subtitle="Active short URLs"
          icon={Link2}
          iconColor="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-950/50"
        />
        <StatsCard
          title="Total Clicks / Traffic"
          value={totalClicks}
          subtitle="Redirect clicks tracked"
          icon={MousePointerClick}
          iconColor="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatsCard
          title="Top Link Performance"
          value={topPerformingUrl?.clicks?.length || 0}
          subtitle={topPerformingUrl ? `ID #${topPerformingUrl.id}` : 'No traffic yet'}
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-950/50"
        />
      </div>

      {/* URL Creation Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Shorten a New URL
        </h2>

        <form onSubmit={handleCreateUrl} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste long destination URL (e.g. https://google.com/search?...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer shrink-0"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Shorten</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Links List / Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Table Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Shortened URLs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredUrls.length} of {urls.length} links
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search links..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-xs font-medium text-slate-500">Loading your links...</p>
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {searchQuery ? 'No matching links found' : 'No URLs shortened yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword.'
                : 'Paste a destination link into the shortener box above to create your first trackable short URL.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Short URL</th>
                  <th className="pb-3 pr-4">Original Destination</th>
                  <th className="pb-3 pr-4">Clicks</th>
                  <th className="pb-3 pr-4">Created</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredUrls.map((url) => {
                  const clickCount = url.clicks?.length || 0;
                  return (
                    <tr key={url.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Short URL with Copy & Visit */}
                      <td className="py-3.5 pr-4 font-mono font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[200px]">
                            {url.shortUrl}
                          </span>
                          <button
                            onClick={() => handleCopy(url.id, url.shortUrl)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Copy short link"
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
                            className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Visit link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Long Destination URL */}
                      <td className="py-3.5 pr-4 max-w-xs truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]" title={url.longUrl}>
                        {url.longUrl}
                      </td>

                      {/* Clicks Badge / Trigger */}
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedClicksUrl(url)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                          title="View click breakdown"
                        >
                          <MousePointerClick className="w-3 h-3" />
                          <span>{clickCount}</span>
                        </button>
                      </td>

                      {/* Created Timestamp */}
                      <td className="py-3.5 pr-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <span title={formatDate(url.createdAt)}>
                          {formatRelativeTime(url.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedQrUrl(url)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                            title="View QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUrl(url.id)}
                            disabled={isDeletingId === url.id}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs transition-colors disabled:opacity-50"
                            title="Delete link"
                          >
                            {isDeletingId === url.id ? (
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
