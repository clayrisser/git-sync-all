import { SourceConfig, TargetConfig } from './types';

export default {
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
  ssh: true,
  target: {
    group: '',
    server: 'bitbucket'
  } as TargetConfig
};
