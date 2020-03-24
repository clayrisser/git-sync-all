import newRegExp from 'newregexp';
import { Command, flags } from '@oclif/command';
import { Flags } from '../types';
import { createConfigManager } from '../config';
import { createContext } from '../context';
import { sync } from '../actions';

export default class Sync extends Command {
  static description = 'sync all git repos';

  static examples = ['$ git-sync-all sync'];

  static flags: Flags = {
    'config-path': flags.string(),
    'source-blacklist': flags.string(),
    'source-forks': flags.boolean(),
    'source-groups': flags.string(),
    'source-owned': flags.boolean(),
    'source-password': flags.string(),
    'source-server': flags.string(),
    'source-slug-regex': flags.string(),
    'source-token': flags.string(),
    'source-username': flags.string(),
    'source-whitelist': flags.string(),
    'target-group': flags.string(),
    'target-password': flags.string(),
    'target-project': flags.string(),
    'target-server': flags.string(),
    'target-token': flags.string(),
    'target-username': flags.string(),
    config: flags.string(),
    debug: flags.boolean()
  };

  static args = [];

  async run() {
    const { flags } = this.parse(Sync);
    const configManager = createConfigManager(
      JSON.parse(flags.config || '{}'),
      flags['config-path']
    );
    let { config } = configManager;
    config = configManager.mergeConfig({
      source: {
        forks: flags.forks || config.source.forks,
        owned: flags['source-owned'] || config.source.owned,
        password: flags['source-password'] || config.source.password,
        server: flags['source-server'] || config.source.server,
        token: flags['source-token'] || config.source.token,
        username: flags['source-username'] || config.source.username,
        blacklist: new Set([
          ...config.source.blacklist,
          ...(flags['source-blacklist']
            ? flags['source-blacklist'].split(',')
            : config.source.blacklist)
        ]),
        groups: new Set([
          ...config.source.groups,
          ...(flags['source-groups']
            ? flags['source-groups'].split(',')
            : config.source.groups)
        ]),
        slugRegex: newRegExp(
          flags['source-slug-regex']
            ? flags['source-slug-regex']
            : config.source.slugRegex
        ),
        whitelist: new Set([
          ...config.source.whitelist,
          ...(flags['source-whitelist']
            ? flags['source-whitelist'].split(',')
            : config.source.whitelist)
        ])
      },
      target: {
        username: flags['target-username'] || config.target.username,
        password: flags['target-password'] || config.target.password,
        group: flags['target-group'] || config.target.group,
        server: flags['target-server'] || config.target.server,
        token: flags['target-token'] || config.target.token,
        project:
          flags['target-project'] ||
          (config.target.project.length
            ? config.target.project
            : config.source.server.toUpperCase().substr(0, 3))
      },
      debug: flags.debug
    });
    const context = createContext(config);
    const { logger } = context;
    logger.debug(config);
    await sync(config, context);
  }
}
