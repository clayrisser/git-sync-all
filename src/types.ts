export interface UserConfig {
  ssh: boolean;
}

export interface Repo {
  detail: object;
  httpRemote: string;
  name: string;
  sshRemote: string;
}

export interface Config extends UserConfig {
  server: string;
  token: string;
}

export type Action = (config: Config) => any;

export interface Actions {
  [key: string]: Action;
}
