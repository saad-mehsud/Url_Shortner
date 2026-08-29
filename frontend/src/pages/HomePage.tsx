import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Link2,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/formatters';
import { URLItem } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<URLItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedQrUrl, setSelectedQrUrl] = useState<URLItem | null>(null);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputUrl.trim()) {
      warning('Empty URL', 'Please enter a valid destination URL to shorten.');
      return;
    }

    let urlToSubmit = inputUrl.trim();
    if (!urlToSubmit.startsWith('http://') && !urlToSubmit.startsWith('https://')) {
      urlToSubmit = `https://${urlToSubmit}`;
    }

    if (!isAuthenticated) {
      // Prompt user to sign in to store and track links
      navigate('/login', { state: { redirectUrl: urlToSubmit } });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createUrl({ url: urlToSubmit });
      setCreatedUrl(res);
      setInputUrl('');
      success('URL Shortened!', 'Your link is ready and click tracking is activated.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to shorten URL.';
      error('Shortening Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (url: string) => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      success('Copied!', 'Shortened URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 text-center space-y-8 overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fast, Simple & Secure URL Shortener</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Shorten URLs,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Track Analytics
            </span>
            , and Secure Every Link.
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Transform lengthy links into ultra-clean short links with instant redirection,
            real-time visit metrics, QR code generation, and reliable link security.
          </p>
        </div>

        {/* Shortener Box */}
        <div className="max-w-2xl mx-auto px-4">
          <form
            onSubmit={handleShorten}
            className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col sm:flex-row gap-2 transition-all focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
          >
            <div className="flex-1 flex items-center gap-3 px-3">
              <Link2 className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste your long destination URL here (e.g. https://github.com/...)"
                className="w-full bg-transparent border-none text-slate-900 dark:text-white text-sm focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Generating...</span>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Created Link Card */}
          {createdUrl && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-left space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Your Shortened Link Is Live
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ID: #{createdUrl.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                <div className="truncate font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {createdUrl.shortUrl}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(createdUrl.shortUrl)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedQrUrl(createdUrl)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                    <span>QR</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              💡 <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Create a free account</Link> to save, manage, and track detailed click analytics for all your links.
            </p>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for Creators, Marketers & Teams
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to create fast, reliable, and trackable links with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant Redirection
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Ultra-fast HTTP 302 redirects with automatic click logging, seamless link forwarding, and high availability.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Click Analytics & Logs
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track timestamps, visit counts, referrers, and visitor insights per shortened URL directly in your user dashboard.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Enterprise-Grade Security
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Secure authentication, protected user dashboards, and link verification designed to keep your URLs safe.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl relative overflow-hidden space-y-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black">Ready to get started?</h3>
              <p className="text-sm sm:text-base text-blue-100 max-w-lg">
                Create custom shortened URLs, generate downloadable QR codes, and gain actionable click insights today.
              </p>
            </div>
            <div className="shrink-0">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {selectedQrUrl && (
        <QRCodeModal
          url={selectedQrUrl}
          onClose={() => setSelectedQrUrl(null)}
        />
      )}
    </div>
  );
};
