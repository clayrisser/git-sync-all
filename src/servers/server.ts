import { Repo } from '../types';

export default interface Server {
  getRepos(): Promise<Repo[]>;
}

export interface ServerConfig {
  token: string;
}
