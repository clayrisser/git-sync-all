import { Repo } from '../types';

export interface GetReposConfig {
  owned: boolean;
}

export default interface Server {
  getRepos(config?: GetReposConfig): Promise<Repo[]>;

  createRepo(name: string): Promise<Repo | null>;

  getRepo(name: string): Promise<Repo | null>;
}

export interface ServerConfig {
  clientId: string;
  clientSecret: string;
  token: string;
}
