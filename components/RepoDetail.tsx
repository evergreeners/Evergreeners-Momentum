
import React, { useState, useEffect } from 'react';
import { Repository, RepoAnalysis, ImprovementSuggestion } from '../types';
import { GitHubService } from '../services/githubService';
import { GeminiService } from '../services/geminiService';
import { 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck, 
  AlertCircle,
  ExternalLink,
  Plus,
  ArrowRight
} from 'lucide-react';

interface Props {
  repo: Repository;
  githubService: GitHubService;
  onBack: () => void;
}

const RepoDetail: React.FC<Props> = ({ repo, githubService, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);

  useEffect(() => {
    analyzeRepo();
  }, [repo]);

  const analyzeRepo = async () => {
    setLoading(true);
    try {
      const contents = await githubService.getRepoContents(repo.owner?.login || '', repo.name);
      const fileNames = contents.map(c => c.name);
      
      let readme = '';
      try {
        readme = await githubService.getFileContent(repo.owner?.login || '', repo.name, 'README.md');
      } catch (e) {
        // No README found, ignore
      }

      const result = await GeminiService.analyzeRepo(repo.name, fileNames, readme);
      setAnalysis(result);
      
      const suggestedImprovements = await GeminiService.generateSuggestions(result);
      setSuggestions(suggestedImprovements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-zinc-500">AI is deep-diving into {repo.name}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <a 
            href={repo.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
          <button 
            onClick={analyzeRepo}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Re-analyze
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Health and Metrics */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-800 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Repository Health</h3>
                  <p className="text-zinc-400 text-sm">Automated analysis of repository structure and standards.</p>
                </div>
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      className="text-zinc-800"
                    />
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - (analysis?.healthScore || 0) / 100)}
                      className="text-indigo-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold text-white">{analysis?.healthScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Metric label="Language" value={analysis?.metrics.language} />
                <Metric label="Framework" value={analysis?.metrics.framework || 'N/A'} />
                <Metric label="Package Mgr" value={analysis?.metrics.packageManager || 'N/A'} />
                <Metric label="Has Tests" value={analysis?.metrics.hasTests ? 'Yes' : 'No'} />
                <Metric label="TODO Count" value={analysis?.metrics.todoCount || 0} />
                <Metric label="Branch" value={repo.default_branch} />
              </div>
            </div>

            <div className="p-8 space-y-6">
              <h4 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Standards Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CheckItem label="README.md" checked={analysis?.completeness.readme} />
                <CheckItem label="CONTRIBUTING.md" checked={analysis?.completeness.contributing} />
                <CheckItem label="LICENSE" checked={analysis?.completeness.license} />
                <CheckItem label="SECURITY.md" checked={analysis?.completeness.security} />
                <CheckItem label="CHANGELOG.md" checked={analysis?.completeness.changelog} />
                <CheckItem label="CODE_OF_CONDUCT.md" checked={analysis?.completeness.codeOfConduct} />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-xl">
            <h4 className="font-bold text-white mb-4">Deep Learning Insights</h4>
            <ul className="space-y-4">
              {analysis?.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-zinc-400 text-sm bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <div className="mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  </div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Daily Micro-Improvements */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              Daily Improvements
            </h4>
            <p className="text-indigo-100 text-xs mb-4">Complete one of these to maintain your commit streak today!</p>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl border border-white/10 group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded text-white">{suggestion.type}</span>
                    <span className="text-[10px] text-indigo-200">{suggestion.estimatedTime}</span>
                  </div>
                  <h5 className="font-bold text-sm mb-1">{suggestion.title}</h5>
                  <p className="text-xs text-indigo-100/70 mb-3">{suggestion.description}</p>
                  <button className="w-full flex items-center justify-center gap-2 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <Plus className="w-3 h-3" />
                    Start Task
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h4 className="font-bold text-white mb-4">Project Activity</h4>
            <div className="space-y-6">
              <ActivityRow 
                label="Latest Commit" 
                value={new Date(repo.pushed_at).toLocaleDateString()} 
                subValue="On branch main"
              />
              <ActivityRow 
                label="Total Stars" 
                value={repo.stargazers_count.toString()} 
                subValue="Organic reach"
              />
              <ActivityRow 
                label="Visibility" 
                value={repo.private ? 'Private' : 'Public'} 
                subValue="Repo visibility"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-white font-medium text-sm truncate">{value}</p>
  </div>
);

const CheckItem: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
  <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
    <span className="text-sm font-medium text-zinc-300">{label}</span>
    {checked ? (
      <FileCheck className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-400" />
    )}
  </div>
);

const ActivityRow: React.FC<{ label: string; value: string; subValue: string }> = ({ label, value, subValue }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
    <div className="text-[10px] text-zinc-500 text-right">{subValue}</div>
  </div>
);

const Zap: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

export default RepoDetail;
