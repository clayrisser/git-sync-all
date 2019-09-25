import { SourceConfig, TargetConfig } from './types';

export default {
  ssh: true,
  source: {
    blacklist: new Set(),
    clientId: '',
    clientSecret: '',
    groups: new Set(),
    owned: true,
    server: 'gitlab',
    token: '',
    whitelist: new Set()
  } as SourceConfig,
  target: {
    group: '',
    project: '',
    server: 'bitbucket'
  } as TargetConfig
};
