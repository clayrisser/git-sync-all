import { Command, flags } from '@oclif/command';

export default class Sync extends Command {
  static description = 'sync all git repos';

  static examples = ['$ git-sync-all sync'];

  static flags = {
    'source-blacklist': flags.string(),
    'source-username': flags.string(),
    'source-password': flags.string(),
    'source-groups': flags.string(),
    'source-owned': flags.boolean(),
    'source-server': flags.string(),
    'source-slug-regex': flags.string(),
    'source-token': flags.string(),
    'source-whitelist': flags.string(),
    'target-username': flags.string(),
    'target-password': flags.string(),
    'target-group': flags.string(),
    'target-project': flags.string(),
    'target-server': flags.string(),
    'target-token': flags.string()
  };

  static args = [];

  async run() {
    const { flags } = this.parse(Sync);
  }
}
