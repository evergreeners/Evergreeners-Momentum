
export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  language: string;
  fork: boolean;
  private: boolean;
  default_branch: string;
  owner?: {
    login: string;
    avatar_url: string;
  };
}

export interface RepoAnalysis {
  healthScore: number;
  completeness: {
    readme: boolean;
    contributing: boolean;
    license: boolean;
    security: boolean;
    changelog: boolean;
    codeOfConduct: boolean;
  };
  metrics: {
    language: string;
    framework?: string;
    packageManager?: string;
    hasTests: boolean;
    todoCount: number;
  };
  recommendations: string[];
}

export interface ImprovementSuggestion {
  id: string;
  type: 'documentation' | 'structure' | 'hygiene';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export interface AppState {
  token: string | null;
  user: GitHubUser | null;
  repos: Repository[];
  selectedRepo: Repository | null;
  analysis: Record<string, RepoAnalysis>;
}

export enum View {
  Dashboard = 'dashboard',
  Analysis = 'analysis',
  Streak = 'streak',
  Generator = 'generator',
  Settings = 'settings'
}
