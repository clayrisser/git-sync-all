import axios, { AxiosInstance } from 'axios';
import { responseLogger, requestLogger, errorLogger } from 'axios-logger';
import { Config } from '../config';
import { Repo } from '../types';
import Server, {
  CreateRepoConfig,
  GetRepoConfig,
  GetReposConfig,
  ServerConfig
} from './server';

export interface Detail {
  full_name: string;
  html_url: string;
  name: string;
  ssh_url: string;
}

export default class GitHub implements Server {
  public instance: AxiosInstance;

  constructor(public serverConfig: ServerConfig, public config: Config) {
    this.instance = axios.create({
      baseURL: 'https://api.github.com',
      responseType: 'json',
      auth: {
        username: serverConfig.username,
        password: serverConfig.password.length
          ? serverConfig.password
          : serverConfig.token
      },
      headers: {
        Accept: 'application/vnd.github.v3+json'
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
      await this.instance.get('/user/repos', {
        params: { owned: config?.owned }
      })
    ).data as Detail[];
    return details.map((detail) => {
      const [group, slug] = detail.full_name.split('/');
      return {
        detail,
        group,
        httpRemote: `${detail.html_url}.git`,
        name: detail.name,
        slug,
        sshRemote: detail.ssh_url
      };
    });
  }

  async getRepo(config?: GetRepoConfig): Promise<Repo | null> {
    config = {
      slug: '',
      group: '',
      ...(config || {})
    };
    const repoPath = `${config.group}/${config.slug}`;
    const detail =
      ((
        await this.instance.get(`/repos/${repoPath}`).catch((err) => {
          if (err.response.status === 404) return null;
          throw err;
        })
      )?.data as Detail) || null;
    if (!detail) return null;
    const [group, slug] = detail.full_name.split('/');
    return {
      detail,
      group,
      httpRemote: `${detail.html_url}.git`,
      name: detail.name,
      slug,
      sshRemote: detail.ssh_url
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
      await this.instance.post('/user/repos', {
        name: config.slug,
        private: true
      })
    ).data as Detail;
    const [group, slug] = detail.full_name.split('/');
    return {
      detail,
      group,
      httpRemote: `${detail.html_url}.git`,
      name: detail.name,
      slug,
      sshRemote: detail.ssh_url
    };
  }
}
