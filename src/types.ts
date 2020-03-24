import flags from '@oclif/command/lib/flags';
import { ServerConfig } from './servers';

export type Flags = flags.Input<any>;

export interface Repo {
  detail: object;
  group: string;
  httpRemote: string;
  name: string;
  slug: string;
  sshRemote: string;
}

export interface SourceConfig extends ServerConfig {
  blacklist: Set<string>;
  forks: boolean;
  groups: Set<string>;
  owned: boolean;
  server: string;
  slugRegex?: RegExp;
  whitelist: Set<string>;
}

export interface TargetConfig extends ServerConfig {
  group: string;
  server: string;
  project: string;
}
