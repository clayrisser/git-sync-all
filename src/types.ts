import {
  Action as EcosystemAction,
  Actions as EcosystemActions,
  Config as EcosystemConfig
} from '@ecosystem/core';
import { ServerConfig } from './servers';

export interface Repo {
  detail: object;
  httpRemote: string;
  name: string;
  path: string;
  sshRemote: string;
}

export interface Config extends ServerConfig, EcosystemConfig {
  server: string;
  ssh: boolean;
}

export type Action = EcosystemAction<Config>;

export type Actions = EcosystemActions<Config>;
