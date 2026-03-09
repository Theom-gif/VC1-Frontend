import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Moon, Search, Sun } from 'lucide-react';

const AUTHOR_THEME_KEY = 'author-theme';

const getQueryFromSearch = (search) => {
  const params = new URLSearchParams(search || '');
  return params.get('q') || '';
};

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(AUTHOR_THEME_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(AUTHOR_THEME_KEY, theme);

    // Keep light/dark mode scoped to author pages only.
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [theme]);

  useEffect(() => {
    if (location.pathname.startsWith('/author/research')) {
      setGlobalSearch(getQueryFromSearch(location.search));
    }
  }, [location.pathname, location.search]);

  const handleGlobalSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = globalSearch.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set('q', trimmed);
    }
    const queryString = params.toString();
    navigate(queryString ? `/author/research?${queryString}` : '/author/research');
  };

  return (
    <div className="flex min-h-screen bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex-1 max-w-md">
            <form onSubmit={handleGlobalSearchSubmit} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search your library..." 
                className="w-full bg-card-dark border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </form>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
              className="p-2 text-slate-400 hover:bg-primary/20 rounded-full transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button className="relative p-2 text-slate-400 hover:bg-primary/20 rounded-full transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
            </button>
            <div className="h-8 w-px bg-white/5 mx-2"></div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
