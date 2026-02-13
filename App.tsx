
import React, { useState, useEffect, useMemo } from 'react';
import { GitHubService } from './services/githubService';
import { View, AppState, Repository, GitHubUser } from './types';
import Dashboard from './components/Dashboard';
import RepoDetail from './components/RepoDetail';
import StreakStats from './components/StreakStats';
import Generator from './components/Generator';
import { 
  Github, 
  LayoutDashboard, 
  LineChart, 
  Settings, 
  Zap, 
  FileText,
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gtm_token'));
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const githubService = useMemo(() => token ? new GitHubService(token) : null, [token]);

  useEffect(() => {
    if (githubService) {
      loadInitialData();
    }
  }, [githubService]);

  const loadInitialData = async () => {
    if (!githubService) return;
    setLoading(true);
    setError(null);
    try {
      const [userData, reposData] = await Promise.all([
        githubService.getUser(),
        githubService.getRepos()
      ]);
      setUser(userData);
      setRepos(reposData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to GitHub');
      setToken(null);
      localStorage.removeItem('gtm_token');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newToken = formData.get('token') as string;
    if (newToken) {
      localStorage.setItem('gtm_token', newToken);
      setToken(newToken);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gtm_token');
    setToken(null);
    setUser(null);
    setRepos([]);
    setCurrentView(View.Dashboard);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">GitMomentum</h1>
            <p className="text-zinc-400">Connect your GitHub to boost repo health</p>
          </div>

          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">GitHub Personal Access Token</label>
              <input
                name="token"
                type="password"
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="ghp_xxxxxxxxxxxx"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Generate a token with <code className="bg-zinc-800 px-1 rounded text-zinc-300">repo</code> scopes to manage your projects.
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Connect with GitHub
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-500">Your token is stored locally in your browser.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-200">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">GitMomentum</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <NavItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              active={currentView === View.Dashboard} 
              onClick={() => { setCurrentView(View.Dashboard); setSelectedRepo(null); }} 
            />
            <NavItem 
              icon={<LineChart className="w-5 h-5" />} 
              label="Streaks" 
              active={currentView === View.Streak} 
              onClick={() => setCurrentView(View.Streak)} 
            />
            <NavItem 
              icon={<FileText className="w-5 h-5" />} 
              label="Templates" 
              active={currentView === View.Generator} 
              onClick={() => setCurrentView(View.Generator)} 
            />
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={currentView === View.Settings} 
              onClick={() => setCurrentView(View.Settings)} 
            />
          </nav>

          <div className="p-4 border-t border-zinc-800 mt-auto">
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl mb-4">
              <img src={user?.avatar_url} className="w-10 h-10 rounded-full border border-zinc-700" alt="Avatar" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || user?.login}</p>
                <p className="text-xs text-zinc-500 truncate">@{user?.login}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-red-400 text-sm font-medium py-2 rounded-lg hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-zinc-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {selectedRepo ? selectedRepo.name : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search repositories..." 
                className="bg-transparent border-none text-sm ml-2 focus:ring-0 w-full"
              />
            </div>
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-zinc-500 animate-pulse">Synchronizing with GitHub...</p>
            </div>
          ) : (
            <>
              {selectedRepo ? (
                <RepoDetail 
                  repo={selectedRepo} 
                  githubService={githubService!} 
                  onBack={() => setSelectedRepo(null)} 
                />
              ) : (
                <>
                  {currentView === View.Dashboard && (
                    <Dashboard 
                      repos={repos} 
                      onSelectRepo={setSelectedRepo} 
                    />
                  )}
                  {currentView === View.Streak && <StreakStats />}
                  {currentView === View.Generator && <Generator repos={repos} githubService={githubService!} />}
                  {currentView === View.Settings && (
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
                      <h3 className="text-xl font-bold text-white mb-6">Settings</h3>
                      <div className="space-y-6 max-w-lg">
                        <section>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Connected Account</label>
                          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={user?.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                              <span className="text-white font-medium">{user?.login}</span>
                            </div>
                            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Active</span>
                          </div>
                        </section>
                        <section>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Notification Preferences</label>
                          <div className="space-y-3">
                            <ToggleItem label="In-app alerts for dormant repos" checked />
                            <ToggleItem label="Weekly health summary" checked />
                            <ToggleItem label="Streak preservation warnings" />
                          </div>
                        </section>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ToggleItem: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-zinc-300">{label}</span>
    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  </div>
);

export default App;
