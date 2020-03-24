import { SourceConfig, TargetConfig } from '../types';

const source: SourceConfig = {
  blacklist: new Set(),
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
  ssh: true,
  source,
  target
};
