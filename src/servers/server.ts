import { Repo } from '../types';

export interface GetReposConfig {
  owned: boolean;
}

export interface GetRepoConfig {
  group: string;
  slug: string;
}

export default interface Server {
  getRepos(config?: GetReposConfig): Promise<Repo[]>;

  createRepo(name: string): Promise<Repo | null>;

  getRepo(config?: GetRepoConfig): Promise<Repo | null>;
}

export interface ServerConfig {
  clientId: string;
  clientSecret: string;
  token: string;
}
