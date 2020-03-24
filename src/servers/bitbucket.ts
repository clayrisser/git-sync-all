import axios, { AxiosInstance } from 'axios';
import qs from 'qs';
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
  name: string;
  full_name: string;
}

export default class BitBucket implements Server {
  public instance: AxiosInstance;

  private _token: string;

  constructor(public serverConfig: ServerConfig, public config: Config) {
    this.instance = axios.create({
      baseURL: 'https://api.bitbucket.org/2.0',
      responseType: 'json'
    });
    if (config.debug) {
      this.instance.interceptors.request.use(requestLogger, errorLogger);
      this.instance.interceptors.response.use(responseLogger, errorLogger);
    }
  }

  async getToken(): Promise<string> {
    if (this._token) return this._token;
    const instance = axios.create({
      baseURL: 'https://bitbucket.org/site/oauth2/access_token',
      responseType: 'json'
    });
    instance.interceptors.request.use(requestLogger, errorLogger);
    instance.interceptors.response.use(responseLogger, errorLogger);
    this._token = (
      await instance.post(qs.stringify({ grant_type: 'client_credentials' }), {
        auth: {
          username: this.serverConfig.username,
          password: this.serverConfig.password
        }
      })
    ).data.access_token;
    return this._token;
  }

  async getRepos(config?: GetReposConfig): Promise<Repo[]> {
    config = {
      owned: true,
      forks: false,
      ...(config || {})
    };
    const details = (
      await this.instance.get('/repositories', {
        params: {
          ...(config.owned ? { role: 'owner' } : {})
        },
        headers: { Authorization: `Bearer ${await this.getToken()}` }
      })
    ).data.values as Detail[];
    return details.map((detail) => {
      const [group, slug] = detail.full_name.split('/');
      return {
        detail,
        group,
        httpRemote: `https://bitbucket.org/${detail.full_name}.git`,
        name: detail.name,
        slug,
        sshRemote: `git@bitbucket.org/${detail.full_name}.git`
      };
    });
  }

  async getRepo(config?: GetRepoConfig): Promise<Repo | null> {
    config = {
      group: '',
      slug: '',
      ...(config || {})
    };
    const detail =
      ((
        await this.instance
          .get(`/repositories/${config.group}/${config.slug}`)
          .catch((err) => {
            if (err.response.status === 404) return null;
            throw err;
          })
      )?.data as Detail) || null;
    if (!detail) return null;
    const [group, slug] = detail.full_name.split('/');
    return {
      detail,
      group,
      httpRemote: `https://bitbucket.org/${detail.full_name}.git`,
      name: detail.name,
      slug,
      sshRemote: `git@bitbucket.org/${detail.full_name}.git`
    };
  }

  async createRepo(config?: CreateRepoConfig): Promise<Repo | null> {
    config = {
      group: '',
      slug: '',
      project: 'PRO',
      ...(config || {})
    };
    const detail = (
      await this.instance
        .post(`/repositories/${config.group}/${config.slug}`, {
          scm: 'git',
          project: {
            key: config.project || 'PRO'
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            throw new Error('creating bitbucket repo from api is forbidden');
          }
          throw err;
        })
    ).data as Detail;
    const [group, slug] = detail.full_name.split('/');
    return {
      detail,
      group,
      httpRemote: `https://bitbucket.org/${detail.full_name}.git`,
      name: detail.name,
      slug,
      sshRemote: `git@bitbucket.org/${detail.full_name}.git`
    };
  }
}
