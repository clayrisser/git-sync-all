import ConfManager from 'conf-manager';
import defaultConfig from './default';
import { SourceConfig, TargetConfig } from '../types';

export interface Config {
  action: string;
  source: SourceConfig;
  ssh: boolean;
  target: TargetConfig;
}

export function createConfigManager(
  optionsConfig: Partial<Config> = {}
): ConfManager<Config> {
  const confManager = new ConfManager<Config>(
    { name: 'gitsyncall' },
    optionsConfig,
    defaultConfig
  );
  confManager.loadUserConfig = (): Partial<Config> => {
    console.log('loading user config');
    return {};
  };
  return confManager;
}
