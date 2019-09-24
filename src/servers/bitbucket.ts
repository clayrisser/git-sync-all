import axios, { AxiosInstance } from 'axios';
import qs from 'qs';
import Server, { ServerConfig, GetReposConfig, GetRepoConfig } from './server';
import { Repo } from '../types';

export interface Detail {
  name: string;
  full_name: string;
}

export default class BitBucket implements Server {
  public instance: AxiosInstance;

  private _token: string;

  constructor(public config: ServerConfig) {
    this.instance = axios.create({
      baseURL: 'https://api.bitbucket.org/2.0',
      responseType: 'json'
    });
  }

  async getToken(): Promise<string> {
    if (this._token) return this._token;
    this._token = (await axios.post(
      'https://bitbucket.org/site/oauth2/access_token',
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        responseType: 'json',
        auth: {
          username: this.config.clientId,
          password: this.config.clientSecret
        }
      }
    )).data.access_token;
    return this._token;
  }

  async getRepos(config?: GetReposConfig): Promise<Repo[]> {
    config = {
      owned: true,
      ...(config || {})
    };
    const details = (await this.instance.get('/repositories', {
      params: {
        ...(config.owned ? { role: 'owner' } : {})
      },
      headers: { Authorization: `Bearer ${await this.getToken()}` }
    })).data.values as Detail[];
    return details.map(detail => {
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
      slug: '',
      group: '',
      ...(config || {})
    };
    const detail = (await this.instance.get(
      `/projects/${encodeURIComponent(`${config.group}/${config.slug}`)}`
    )).data as Detail;
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

  async createRepo(name: string): Promise<Repo | null> {
    const detail = (await this.instance.post('/projects', { name }))
      .data as Detail;
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
