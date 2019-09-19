import cosmiconfig from 'cosmiconfig';
import pkgDir from 'pkg-dir';
import { Command, flags } from '@oclif/command';
import { oc } from 'ts-optchain.macro';
import actions from './actions';
import defaultConfig from './defaultConfig';
import { Config, UserConfig } from './types';

const rootPath = pkgDir.sync(process.cwd()) || process.cwd();

export default class GitSyncAll extends Command {
  static description = 'keep all git repos in sync';

  static flags = {
    help: flags.help({ char: 'h' }),
    server: flags.string({ char: 's', required: false }),
    token: flags.string({ char: 't' }),
    verbose: flags.boolean(),
    version: flags.version({ char: 'v' })
  };

  static args = [{ name: 'ACTION', required: false }];

  get userConfig(): Partial<UserConfig> {
    const userConfig: Partial<UserConfig> = oc(
      cosmiconfig('tsgir').searchSync(rootPath)
    ).config({});
    return { ...userConfig };
  }

  async run() {
    const { args, flags } = this.parse(GitSyncAll);
    const config: Config = {
      server: flags.server || 'gitlab',
      token: flags.token || '',
      ...defaultConfig,
      ...this.userConfig
    };
    const action = args.ACTION || 'sync';
    await actions[action](config);
  }
}
