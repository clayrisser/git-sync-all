import {
  Action as EcosystemAction,
  Actions as EcosystemActions,
  Config as EcosystemConfig
} from '@ecosystem/core';
import { ServerConfig } from './servers';

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
  groups: string[];
  server: string;
  slugRegex?: RegExp;
  whitelist: Set<string>;
}

export interface TargetConfig extends ServerConfig {
  group: string;
  server: string;
}

export interface Config extends EcosystemConfig {
  source: SourceConfig;
  ssh: boolean;
  target: TargetConfig;
}

export type Action = EcosystemAction<Config>;

export type Actions = EcosystemActions<Config>;
