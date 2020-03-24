import ConfManager from 'conf-manager';
import defaultConfig from './default';
import { SourceConfig, TargetConfig } from '../types';

export interface Config {
  source: SourceConfig;
  ssh: boolean;
  target: TargetConfig;
}

export function createConfigManager(
  optionsConfig: Partial<Config> = {},
  _rootPath?: string
): ConfManager<Config> {
  return new ConfManager<Config>(
    {
      name: 'gitsyncall',
      loadProjectConfig: (): Partial<Config> => {
        console.log('loading project config');
        return {};
      },
      loadHomeConfig: (): Partial<Config> => ({})
    },
    optionsConfig,
    defaultConfig
  );
}
