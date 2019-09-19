import { Gitlab } from 'gitlab';
import Server, { ServerConfig } from './server';
import { Repo } from '../types';

export default class GitLab implements Server {
  public client: Gitlab;

  constructor(public config: ServerConfig) {
    this.client = new Gitlab({
      token: config.token
    });
  }

  async getRepos(): Promise<Repo[]> {
    const details = (await this.client.Projects.all({
      owned: true
    })) as {
      name: string;
      ssh_url_to_repo: string;
      http_url_to_repo: string;
    }[];
    return details.map(detail => {
      return {
        detail,
        httpRemote: detail.http_url_to_repo,
        name: detail.name,
        sshRemote: detail.ssh_url_to_repo
      };
    });
  }
}
