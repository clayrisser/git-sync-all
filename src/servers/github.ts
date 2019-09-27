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
  full_name: string;
  html_url: string;
  name: string;
  ssh_url: string;
}

export default class GitHub implements Server {
  public instance: AxiosInstance;

  constructor(public config: ServerConfig) {
    this.instance = axios.create({
      baseURL: 'https://api.github.com',
      responseType: 'json',
      auth: {
        username: config.username,
        password: config.password.length ? config.password : config.token
      },
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
  }

  async getRepos(config?: GetReposConfig): Promise<Repo[]> {
    config = {
      owned: true,
      ...(config || {})
    };
    const details = (await this.instance.get('/user/repos', {
      params: { owned: config.owned }
    })).data as Detail[];
    return details.map(detail => {
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
    const detail = oc(
      await this.instance.get(`/repos/${repoPath}`).catch(err => {
        if (err.response.status === 404) return null;
        throw err;
      })
    ).data(null) as Detail;
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
    const detail = (await this.instance.post('/user/repos', {
      name: config.slug,
      private: true
    })).data as Detail;
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
