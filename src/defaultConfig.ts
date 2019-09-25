import { SourceConfig, TargetConfig } from './types';

export default {
  ssh: true,
  source: {
    blacklist: new Set(),
    groups: new Set(),
    owned: true,
    password: '',
    server: 'gitlab',
    token: '',
    username: '',
    whitelist: new Set()
  } as SourceConfig,
  target: {
    group: '',
    project: '',
    server: 'bitbucket'
  } as TargetConfig
};
