
import { GitHubUser, Repository } from '../types';

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetcher(path: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API Request Failed' }));
      throw new Error(error.message || 'GitHub API error');
    }

    return response.json();
  }

  async getUser(): Promise<GitHubUser> {
    return this.fetcher('/user');
  }

  async getRepos(): Promise<Repository[]> {
    return this.fetcher('/user/repos?sort=updated&per_page=100');
  }

  async getRepoContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    return this.fetcher(`/repos/${owner}/${repo}/contents/${path}`);
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const data = await this.fetcher(`/repos/${owner}/${repo}/contents/${path}`);
    if (data.content) {
      // Decode base64 while handling Unicode correctly
      return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
    }
    return '';
  }

  async getBranch(owner: string, repo: string, branch: string) {
    return this.fetcher(`/repos/${owner}/${repo}/branches/${branch}`);
  }

  async createRef(owner: string, repo: string, ref: string, sha: string) {
    return this.fetcher(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref, sha }),
    });
  }

  /**
   * Writes a file to a specific branch.
   * If baseBranchForSha is provided, it checks that branch for the existing file's SHA,
   * which is more reliable for newly created branches.
   */
  async writeFile(owner: string, repo: string, path: string, message: string, content: string, branch: string, baseBranchForSha?: string) {
    // Robust Unicode to Base64
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    
    let sha: string | undefined;
    const checkBranch = baseBranchForSha || branch;
    
    try {
      const fileData = await this.fetcher(`/repos/${owner}/${repo}/contents/${path}?ref=${checkBranch}`);
      sha = fileData.sha;
    } catch (e) {
      // File doesn't exist on the check branch, which is fine
    }

    return this.fetcher(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: base64Content,
        branch,
        sha
      }),
    });
  }

  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body: string) {
    return this.fetcher(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, head, base, body }),
    });
  }
}
