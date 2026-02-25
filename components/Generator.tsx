
import React, { useState } from 'react';
import { Repository } from '../types';
import { GeminiService } from '../services/geminiService';
import { GitHubService } from '../services/githubService';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  GitPullRequest,
  BookOpen,
  Scale,
  Shield,
  Clock,
  Map,
  Code,
  Bug,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Cpu,
  Zap,
  Layers,
  X,
  Info
} from 'lucide-react';

interface Props {
  repos: Repository[];
  githubService: GitHubService;
}

type Mode = 'template' | 'contextual';

const Generator: React.FC<Props> = ({ repos, githubService }) => {
  const [mode, setMode] = useState<Mode>('template');
  const [selectedRepoName, setSelectedRepoName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('README.md');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [prLoading, setPrLoading] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [prResult, setPrResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  
  // PR Preview State
  const [showPrPreview, setShowPrPreview] = useState(false);
  const [prMetadata, setPrMetadata] = useState({
    title: '',
    description: '',
    branch: '',
    filePath: ''
  });

  const fileTemplates = [
    { id: 'README.md', label: 'README.md', path: 'README.md', icon: <BookOpen className="w-4 h-4" />, color: 'text-indigo-400 bg-indigo-400/10' },
    { id: 'bug_report.md', label: 'Bug Report Template', path: '.github/ISSUE_TEMPLATE/bug_report.md', icon: <Bug className="w-4 h-4" />, color: 'text-orange-400 bg-orange-400/10' },
    { id: 'feature_request.md', label: 'Feature Request Template', path: '.github/ISSUE_TEMPLATE/feature_request.md', icon: <Lightbulb className="w-4 h-4" />, color: 'text-yellow-400 bg-yellow-400/10' },
    { id: 'CONTRIBUTING.md', label: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md', icon: <Code className="w-4 h-4" />, color: 'text-green-400 bg-green-400/10' },
    { id: 'LICENSE', label: 'LICENSE', path: 'LICENSE', icon: <Scale className="w-4 h-4" />, color: 'text-yellow-400 bg-yellow-400/10' },
    { id: 'SECURITY.md', label: 'SECURITY.md', path: 'SECURITY.md', icon: <Shield className="w-4 h-4" />, color: 'text-red-400 bg-red-400/10' },
    { id: 'CHANGELOG.md', label: 'CHANGELOG.md', path: 'CHANGELOG.md', icon: <Clock className="w-4 h-4" />, color: 'text-blue-400 bg-blue-400/10' },
    { id: 'ARCHITECTURE.md', label: 'ARCHITECTURE.md', path: 'ARCHITECTURE.md', icon: <Map className="w-4 h-4" />, color: 'text-purple-400 bg-purple-400/10' },
  ];

  const handleGenerate = async () => {
    if (!selectedRepoName) return;
    setLoading(true);
    setPrResult(null);
    setOutput('');

    try {
      const repo = repos.find(r => r.name === selectedRepoName);
      if (!repo) throw new Error("Repo not found");
      
      const template = fileTemplates.find(t => t.id === fileType);
      const [owner, repoName] = repo.full_name.split('/');

      if (mode === 'template') {
        setLoadingStep('Generating template...');
        const markdown = await GeminiService.generateMarkdown(
          template?.label || fileType,
          `Repo Name: ${repo?.name}, Language: ${repo?.language}, Desc: ${repo?.description}`,
          `Professional GitHub standard ${template?.label}. Use clean formatting and clear placeholders.`
        );
        setOutput(markdown);
      } else {
        setLoadingStep('Crawling repository...');
        const contents = await githubService.getRepoContents(owner, repoName);
        const fileNames = contents.map(c => c.name);

        setLoadingStep('Analyzing manifests...');
        const manifests = ['package.json', 'go.mod', 'requirements.txt', 'cargo.toml', 'pom.xml'];
        let manifestData = 'No manifest found.';
        
        for (const m of manifests) {
          if (fileNames.includes(m)) {
            try {
              const content = await githubService.getFileContent(owner, repoName, m);
              manifestData = `File: ${m}\nContent:\n${content.substring(0, 3000)}`;
              break;
            } catch (e) {
              console.warn(`Could not read ${m}`);
            }
          }
        }

        setLoadingStep('Synthesizing doc...');
        const markdown = await GeminiService.generateContextualMarkdown(
          template?.label || fileType,
          repoName,
          fileNames,
          manifestData
        );
        setOutput(markdown);
      }
    } catch (err: any) {
      console.error(err);
      setPrResult({ success: false, error: `Generation failed: ${err.message}` });
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const preparePrMetadata = () => {
    const template = fileTemplates.find(t => t.id === fileType);
    const fileName = template?.label || fileType;
    const branchName = `evergreeners-improve-${Date.now()}`;
    const prTitle = `Improvement: Add ${fileName}`;
    const prBody = `This PR adds a contextual ${fileName} generated by AI after analyzing the codebase manifests and structure.

Goal: Enhance repository documentation and maintain project hygiene.

Generated by **Evergreeners Momentum**.`;

    setPrMetadata({
      title: prTitle,
      description: prBody,
      branch: branchName,
      filePath: template?.path || fileType
    });
    setShowPrPreview(true);
  };

  const handleExecutePR = async () => {
    if (!selectedRepoName || !output) return;
    setPrLoading(true);
    setPrResult(null);
    setShowPrPreview(false);
    
    try {
      const repo = repos.find(r => r.name === selectedRepoName);
      if (!repo) throw new Error("Repository not found");
      
      const [owner, repoName] = repo.full_name.split('/');
      const baseBranch = repo.default_branch;
      
      const branchData = await githubService.getBranch(owner, repoName, baseBranch);
      const baseSha = branchData.commit.sha;

      await githubService.createRef(owner, repoName, `refs/heads/${prMetadata.branch}`, baseSha);
      await new Promise(resolve => setTimeout(resolve, 2000));

      await githubService.writeFile(
        owner, 
        repoName, 
        prMetadata.filePath, 
        `docs: add ${fileType} via Evergreeners Momentum`, 
        output, 
        prMetadata.branch,
        baseBranch
      );

      const pr = await githubService.createPullRequest(
        owner,
        repoName,
        prMetadata.title,
        prMetadata.branch,
        baseBranch,
        prMetadata.description
      );

      setPrResult({ success: true, url: pr.html_url });
    } catch (err: any) {
      console.error("PR Error Details:", err);
      let userFriendlyError = err.message;
      if (err.message.includes('Resource not accessible by personal access token')) {
        userFriendlyError = "Permission Denied: Ensure your token has 'Contents' and 'Pull Requests' Read/Write access.";
      }
      setPrResult({ success: false, error: userFriendlyError });
    } finally {
      setPrLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {/* PR Preview Modal - Made more responsive */}
      {showPrPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <h5 className="font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-indigo-500" />
                PR Preview
              </h5>
              <button onClick={() => setShowPrPreview(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">PR Title</label>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white">
                  {prMetadata.title}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Description</label>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-400 whitespace-pre-wrap font-sans">
                  {prMetadata.description}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Head Branch</label>
                  <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-indigo-400 truncate">
                    {prMetadata.branch}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Destination Path</label>
                  <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 truncate">
                    /{prMetadata.filePath}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-300/70 leading-relaxed italic">
                  This will create a new branch and open a PR via Evergreeners Momentum.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex flex-col sm:flex-row gap-3 shrink-0">
              <button 
                onClick={() => setShowPrPreview(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleExecutePR}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all order-1 sm:order-2"
              >
                Confirm & Open PR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Side */}
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h4 className="text-lg font-bold text-white mb-6">Engine</h4>
          
          <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
            <button 
              onClick={() => { setMode('template'); setPrResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'template' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Zap className="w-3 h-3" />
              Template
            </button>
            <button 
              onClick={() => { setMode('contextual'); setPrResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'contextual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Cpu className="w-3 h-3" />
              Contextual
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Repository</label>
              <select 
                value={selectedRepoName}
                onChange={(e) => setSelectedRepoName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Choose a repo...</option>
                {repos.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">File Type</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {fileTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setFileType(t.id); setPrResult(null); setOutput(''); }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                      fileType === t.id 
                        ? 'bg-zinc-800 border-indigo-500/50 text-white' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${t.color}`}>{t.icon}</div>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedRepoName || loading}
              className={`w-full mt-4 font-bold py-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${
                mode === 'contextual' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-[10px] opacity-70 animate-pulse">{loadingStep}</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Generate Content
                </div>
              )}
            </button>
          </div>
        </div>

        {prResult && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
            prResult.success 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {prResult.success ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-bold">{prResult.success ? 'Success!' : 'Error'}</p>
              {prResult.success ? (
                <a href={prResult.url} target="_blank" rel="noopener noreferrer" className="text-xs underline block mt-1">
                  View Pull Request
                </a>
              ) : (
                <p className="text-xs mt-1 break-words opacity-80">{prResult.error}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output Preview Area - Optimized Header for Responsiveness */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-[750px] shadow-2xl">
          <div className="bg-zinc-800/50 px-4 sm:px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              {/* Desktop Dots */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-mono text-zinc-400 tracking-wider uppercase truncate">
                  {fileTemplates.find(t => t.id === fileType)?.path || fileType}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              <button 
                onClick={copyToClipboard}
                disabled={!output}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] sm:text-xs font-bold rounded-lg transition-all disabled:opacity-0 whitespace-nowrap"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button 
                onClick={preparePrMetadata}
                disabled={!output || prLoading}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-all disabled:opacity-50 whitespace-nowrap ml-auto sm:ml-0"
              >
                {prLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <GitPullRequest className="w-3 h-3" />}
                {prLoading ? 'Processing...' : 'Prepare PR'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 sm:p-8 bg-zinc-950/40 custom-scrollbar">
            {output ? (
              <div className="max-w-none prose prose-invert prose-zinc prose-sm">
                <pre className="text-zinc-300 font-mono text-[12px] sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-6">
                <div className="relative">
                  <FileText className="w-16 h-16 sm:w-24 sm:h-24 opacity-5" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 text-indigo-500/20 animate-pulse" />
                </div>
                <div className="text-center px-4">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-500 mb-1">Synthesizer Idle.</p>
                  <p className="text-[10px] sm:text-xs text-zinc-600">Select repo & click generate to begin.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
