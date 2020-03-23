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

export interface Config {
  action: string;
  source: SourceConfig;
  ssh: boolean;
  target: TargetConfig;
}

export interface Logger {
  debug(message?: any, ...optionalParams: any[]): any;
  silly(message?: any, ...optionalParams: any[]): any;
  error(message?: any, ...optionalParams: any[]): any;
  info(message?: any, ...optionalParams: any[]): any;
  spinner: Spinner;
  warn(message?: any, ...optionalParams: any[]): any;
}

export interface Spinner {
  fail(message?: string): Spinner;
  info(message?: string): Spinner;
  start(message?: string): Spinner;
  stop(): any;
  succeed(message?: string): Spinner;
  warn(message?: string): Spinner;
}

export type Action<TConfig = Config> = (
  config: TConfig,
  logger?: Logger,
  ...additionalArgs: any[]
) => any;

export interface Actions<TConfig = Config> {
  [key: string]: Action<TConfig>;
}
