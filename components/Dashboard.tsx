
import React, { useState } from 'react';
import { Repository } from '../types';
import { 
  Star, 
  GitBranch, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface Props {
  repos: Repository[];
  onSelectRepo: (repo: Repository) => void;
}

const Dashboard: React.FC<Props> = ({ repos, onSelectRepo }) => {
  const [filter, setFilter] = useState('all');

  const filteredRepos = repos.filter(repo => {
    if (filter === 'all') return true;
    if (filter === 'owner') return !repo.fork;
    if (filter === 'fork') return repo.fork;
    return true;
  });

  const getStatusColor = (updatedAt: string) => {
    const days = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 7) return 'text-green-400 bg-green-400/10';
    if (days < 30) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getStatusLabel = (updatedAt: string) => {
    const days = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 7) return 'Active';
    if (days < 30) return 'Needs attention';
    return 'Dormant';
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Repositories" 
          value={repos.length} 
          icon={<GitBranch className="text-blue-400" />} 
          trend="+2 this month"
        />
        <StatCard 
          title="Avg Health Score" 
          value="78%" 
          icon={<ShieldAlert className="text-yellow-400" />} 
          trend="Improved 5% from last week"
        />
        <StatCard 
          title="Streak Status" 
          value="8 Days" 
          icon={<CheckCircle2 className="text-green-400" />} 
          trend="Next milestone in 2 days"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Your Projects
          <span className="text-xs font-normal bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{filteredRepos.length}</span>
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterButton label="Owned" active={filter === 'owner'} onClick={() => setFilter('owner')} />
          <FilterButton label="Forks" active={filter === 'fork'} onClick={() => setFilter('fork')} />
        </div>
      </div>

      {/* Repo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.map(repo => (
          <div 
            key={repo.id}
            onClick={() => onSelectRepo(repo)}
            className="group bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <GithubIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getStatusColor(repo.updated_at)}`}>
                {getStatusLabel(repo.updated_at)}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">
              {repo.name}
            </h4>
            <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px] mb-4">
              {repo.description || 'No description provided.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${repo.language ? 'bg-indigo-500' : 'bg-zinc-600'}`}></span>
                {repo.language || 'Plain Text'}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {repo.stargazers_count}
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {new Date(repo.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend: string }> = ({ title, value, icon, trend }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl shadow-black/20">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-zinc-400">{title}</span>
      <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className="text-xs text-zinc-500">{trend}</div>
  </div>
);

const FilterButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export default Dashboard;
