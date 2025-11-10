import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const authed = localStorage.getItem('auth');
  const isGuest = authed === 'guest';
  const isTestRoute = location.pathname.startsWith('/test/');

  // Global per-tab heartbeat to detect number of open tabs
  useEffect(() => {
    let sessionId = null;
    try { sessionId = sessionStorage.getItem('site:sessionId'); } catch (_) {}
    if (!sessionId) {
      sessionId = `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try { sessionStorage.setItem('site:sessionId', sessionId); } catch (_) {}
    }

    const KEY = 'tabs:heartbeats';
    const TTL = 4000;
    const touch = () => {
      try {
        const now = Date.now();
        const raw = localStorage.getItem(KEY);
        const map = raw ? JSON.parse(raw) : {};
        // purge stale
        for (const k of Object.keys(map)) {
          if (!map[k] || (now - map[k]) > TTL) delete map[k];
        }
        map[sessionId] = now;
        localStorage.setItem(KEY, JSON.stringify(map));
      } catch (_) {}
    };
    const iv = setInterval(touch, 1000);
    touch();
    const onVis = () => touch();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
      // Optionally clear our entry quickly
      try {
        const raw = localStorage.getItem(KEY);
        const map = raw ? JSON.parse(raw) : {};
        delete map[sessionId];
        localStorage.setItem(KEY, JSON.stringify(map));
      } catch (_) {}
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }, [lang]);

  const logout = () => {
    localStorage.removeItem('auth');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isTestRoute ? (
              <button
                type="button"
                onClick={() => {
                  try {
                    window.dispatchEvent(new CustomEvent('test:end_request'));
                  } catch (_) {}
                }}
                className="font-bold tracking-tight hover:opacity-90"
              >
                FGE Test Platform
              </button>
            ) : (
              <Link to="/" className="font-bold tracking-tight hover:opacity-90">FGE Test Platform</Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isGuest && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">Guest</span>
            )}
            {!isTestRoute && (
              <select
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md px-2 py-1 text-sm"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Language selector"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            )}
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span>© {new Date().getFullYear()} FGE</span>
          <a href="https://github.com/Spydomain" target="_blank" rel="noreferrer" className="hover:underline">Built by Spydomain</a>
        </div>
      </footer>
    </div>
  );
}
