import axios, { AxiosInstance } from 'axios';
import Server, { ServerConfig } from './server';
import { Repo } from '../types';

export interface Detail {
  http_url_to_repo: string;
  name: string;
  path_with_namespace: string;
  ssh_url_to_repo: string;
}

export default class GitLab implements Server {
  public instance: AxiosInstance;

  constructor(public config: ServerConfig) {
    this.instance = axios.create({
      baseURL: 'https://gitlab.com/api/v4',
      responseType: 'json',
      headers: {
        'Private-Token': config.token
      }
    });
  }

  async getRepos(): Promise<Repo[]> {
    const details = (await this.instance.get('/projects', {
      params: { owned: true }
    })).data as Detail[];
    return details.map(detail => {
      const [group, slug] = detail.path_with_namespace.split('/');
      return {
        detail,
        group,
        httpRemote: detail.http_url_to_repo,
        name: detail.name,
        slug,
        sshRemote: detail.ssh_url_to_repo
      };
    });
  }

  async getRepo(name: string): Promise<Repo | null> {
    const detail = (await this.instance.get(
      `/projects/${encodeURIComponent(name)}`
    )).data as Detail;
    const [group, slug] = detail.path_with_namespace.split('/');
    return {
      detail,
      group,
      httpRemote: detail.http_url_to_repo,
      name: detail.name,
      slug,
      sshRemote: detail.ssh_url_to_repo
    };
  }

  async createRepo(name: string): Promise<Repo | null> {
    const detail = (await this.instance.post('/projects', { name }))
      .data as Detail;
    const [group, slug] = detail.path_with_namespace.split('/');
    return {
      detail,
      group,
      httpRemote: detail.http_url_to_repo,
      name: detail.name,
      slug,
      sshRemote: detail.ssh_url_to_repo
    };
  }
}
