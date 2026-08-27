import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Server, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { HealthReport } from '../types';

export const Footer: React.FC = () => {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSystemHealth = async () => {
      try {
        setIsCheckingHealth(true);
        const report = await api.getHealth();
        if (isMounted) setHealth(report);
      } catch {
        if (isMounted) {
          setHealth({ status: 'Offline' });
        }
      } finally {
        if (isMounted) setIsCheckingHealth(false);
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // 30s probe
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isHealthy = health?.status?.toLowerCase() === 'healthy';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Info & Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                ShortLink API & UI
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Enterprise-ready, high-throughput URL shortening service built with ASP.NET Core (.NET 10),
              PostgreSQL, JWT token rotation, token reuse detection, and React 19.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                .NET 10.0
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                PostgreSQL
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                React 19
              </span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Home Shortener
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  My Links & Stats
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Live System Diagnostics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              API Status
            </h4>
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  Backend API
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isHealthy
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {health?.status || (isCheckingHealth ? 'Checking...' : 'Unknown')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-400" />
                  PostgreSQL
                </span>
                <span className="font-mono text-[10px]">
                  {health?.results?.npgsql?.status || (isHealthy ? 'Healthy' : 'N/A')}
                </span>
              </div>

              <a
                href="/scalar/v1"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Scalar API Reference
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} URL Shortener Project. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for high speed & security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
