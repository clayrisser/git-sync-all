import {
  Action as EcosystemAction,
  Actions as EcosystemActions,
  Config as EcosystemConfig
} from '@ecosystem/core';

export interface Repo {
  detail: object;
  httpRemote: string;
  name: string;
  sshRemote: string;
}

export interface Config extends EcosystemConfig {
  server: string;
  ssh: boolean;
  token: string;
}

export type Action = EcosystemAction<Config>;

export type Actions = EcosystemActions<Config>;
