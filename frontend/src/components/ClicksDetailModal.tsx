import React from 'react';
import { X, MousePointerClick, Calendar, Globe, Monitor, ExternalLink } from 'lucide-react';
import { URLItem } from '../types';
import { formatDate, formatRelativeTime } from '../utils/formatters';

interface ClicksDetailModalProps {
  url: URLItem | null;
  onClose: () => void;
}

export const ClicksDetailModal: React.FC<ClicksDetailModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  const clicks = url.clicks || [];
  const totalClicks = clicks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Click Analytics Breakdown
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-xs">
                {url.shortUrl}
              </span>
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Clicks Banner */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              Total Traffic
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {totalClicks} <span className="text-sm font-normal text-slate-500">total clicks</span>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <span>Created on</span>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {formatDate(url.createdAt)}
            </p>
          </div>
        </div>

        {/* Scrollable Clicks Table/List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {totalClicks === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No clicks recorded yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Share your shortened link to start tracking visitor clicks, timestamps, and referrers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 pr-4">Referrer</th>
                    <th className="pb-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                  {clicks.map((click, index) => (
                    <tr key={click.clickId || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pr-4 text-slate-400">{index + 1}</td>
                      <td className="py-3 pr-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-sans">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(click.dateClicke)}</span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({formatRelativeTime(click.dateClicke)})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 max-w-[180px] truncate">
                          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{click.referrer || 'Direct / None'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          <span>{click.ipAddress || 'Internal/Unknown'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
