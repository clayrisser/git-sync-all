import { SourceConfig, TargetConfig } from '../types';

const source: SourceConfig = {
  blacklist: new Set(),
  forks: false,
  groups: new Set(),
  owned: true,
  password: '',
  server: 'gitlab',
  token: '',
  username: '',
  whitelist: new Set()
};

const target: TargetConfig = {
  group: '',
  password: '',
  project: '',
  server: 'bitbucket',
  token: '',
  username: ''
};

export default {
  debug: false,
  source,
  ssh: true,
  target
};
