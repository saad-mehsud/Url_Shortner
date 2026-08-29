import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Link2, Zap, Shield, BarChart3, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Info & Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                ShortLink
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Fast, reliable, and secure URL shortening service with comprehensive click analytics,
              custom shortened links, and instant QR code generation.
            </p>
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

          {/* Column 3: Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>Instant Redirects</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Click Analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-purple-500" />
                <span>QR Code Creation</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure Links</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ShortLink. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for speed & simplicity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
