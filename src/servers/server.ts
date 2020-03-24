import { Repo } from '../types';

export interface GetReposConfig {
  forks: boolean;
  owned: boolean;
}

export interface GetRepoConfig {
  group: string;
  slug: string;
}

export interface CreateRepoConfig {
  group: string;
  slug: string;
  project: string;
}

export default interface Server {
  getRepos(config?: GetReposConfig): Promise<Repo[]>;

  createRepo(config?: CreateRepoConfig): Promise<Repo | null>;

  getRepo(config?: GetRepoConfig): Promise<Repo | null>;
}

export interface ServerConfig {
  username: string;
  password: string;
  token: string;
}
