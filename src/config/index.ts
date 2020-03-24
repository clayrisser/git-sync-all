import ConfManager from 'conf-manager';
import defaultConfig from './default';
import { SourceConfig, TargetConfig } from '../types';

export interface Config {
  debug: boolean;
  source: SourceConfig;
  ssh: boolean;
  target: TargetConfig;
}

export function createConfigManager(
  optionsConfig: Partial<Config> = {},
  projectConfigPath?: string,
  _rootPath?: string
): ConfManager<Config> {
  return new ConfManager<Config>(
    {
      loadHomeConfig: true,
      name: 'gitsyncall',
      projectConfigPath
    },
    optionsConfig,
    defaultConfig
  );
}
