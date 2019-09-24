import { Repo } from '../types';

export default interface Server {
  getRepos(): Promise<Repo[]>;

  createRepo(name: string): Promise<Repo | null>;

  getRepo(name: string): Promise<Repo | null>;
}

export interface ServerConfig {
  token: string;
}
