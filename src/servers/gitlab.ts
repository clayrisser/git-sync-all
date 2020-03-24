import axios, { AxiosInstance } from 'axios';
import { responseLogger, requestLogger, errorLogger } from 'axios-logger';
import { Config } from '../config';
import { Repo } from '../types';
import Server, {
  ServerConfig,
  GetReposConfig,
  GetRepoConfig,
  CreateRepoConfig
} from './server';

export interface Detail {
  forked_from_project: object;
  http_url_to_repo: string;
  name: string;
  path_with_namespace: string;
  ssh_url_to_repo: string;
}

export default class GitLab implements Server {
  public instance: AxiosInstance;

  constructor(public serverConfig: ServerConfig, public config: Config) {
    this.instance = axios.create({
      baseURL: 'https://gitlab.com/api/v4',
      responseType: 'json',
      headers: {
        'Private-Token': serverConfig.token
      }
    });
    if (config.debug) {
      this.instance.interceptors.request.use(requestLogger, errorLogger);
      this.instance.interceptors.response.use(responseLogger, errorLogger);
    }
  }

  async getRepos(config?: GetReposConfig): Promise<Repo[]> {
    config = {
      owned: true,
      forks: false,
      ...(config || {})
    };
    const details = (
      await this.instance.get('/projects', {
        params: { owned: config.owned }
      })
    ).data as Detail[];
    return details.reduce((repos: Repo[], detail: Detail) => {
      const [group, slug] = detail.path_with_namespace.split('/');
      if (!config?.forks && !!detail.forked_from_project) return repos;
      repos.push({
        detail,
        group,
        httpRemote: detail.http_url_to_repo,
        name: detail.name,
        slug,
        sshRemote: detail.ssh_url_to_repo
      });
      return repos;
    }, []);
  }

  async getRepo(config?: GetRepoConfig): Promise<Repo | null> {
    config = {
      slug: '',
      group: '',
      ...(config || {})
    };
    const detail =
      ((
        await this.instance
          .get(`/projects/${encodeURIComponent(config.slug)}`)
          .catch((err) => {
            console.log('ERR RESP', err.response.status);
            if (err.response.status === 404) return null;
            throw err;
          })
      )?.data as Detail) || null;
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
    const detail = (
      await this.instance.post('/projects', {
        name: config.slug
      })
    ).data as Detail;
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
