import { flags } from '@oclif/command';
import { Command as EcosystemCommand } from '@ecosystem/core';

export default class Command extends EcosystemCommand {
  static description = 'keep all git repos in sync';

  static flags = {
    server: flags.string({ char: 's', required: false }),
    token: flags.string({ char: 't' })
  };

  async run() {
    const { flags } = this.parse(Command.EcosystemCommand);
    return {
      runtimeConfig: {
        server: flags.server || 'gitlab',
        token: flags.token || ''
      }
    };
  }
}
