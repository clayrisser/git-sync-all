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
  const confManager = new ConfManager<Config>(
    { name: 'gitsyncall' },
    optionsConfig,
    defaultConfig
  );
  confManager.loadUserConfig = (): Partial<Config> => {
    return {};
  };
  return confManager;
}
