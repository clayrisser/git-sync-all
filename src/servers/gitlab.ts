import axios, { AxiosInstance } from 'axios';
import { oc } from 'ts-optchain.macro';
import Server, {
  ServerConfig,
  GetReposConfig,
  GetRepoConfig,
  CreateRepoConfig
} from './server';
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

  async getRepos(config?: GetReposConfig): Promise<Repo[]> {
    config = {
      owned: true,
      ...(config || {})
    };
    const details = (await this.instance.get('/projects', {
      params: { owned: config.owned }
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

  async getRepo(config?: GetRepoConfig): Promise<Repo | null> {
    config = {
      slug: '',
      group: '',
      ...(config || {})
    };
    const detail = oc(
      await this.instance
        .get(`/projects/${encodeURIComponent(config.slug)}`)
        .catch(err => {
          if (err.response.status === 404) return null;
          throw err;
        })
    ).data(null) as Detail;
    if (!detail) return null;
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

  async createRepo(config?: CreateRepoConfig): Promise<Repo | null> {
    config = {
      group: '',
      project: 'PROJ',
      slug: '',
      ...(config || {})
    };
    const detail = (await this.instance.post('/projects', {
      name: config.slug
    })).data as Detail;
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
