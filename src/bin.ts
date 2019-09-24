import { handle as handleError } from '@oclif/errors/lib/handle';
import Ecosystem from '@ecosystem/core';
import Command from './command';
import defaultConfig from './defaultConfig';
import actions from './actions';
import { Config, Actions } from './types';

(async () => {
  try {
    const ecosystem = new Ecosystem<Config, Actions>(
      'gitsyncall',
      defaultConfig,
      actions,
      Command
    );
    await ecosystem.run();
  } catch (err) {
    handleError(err);
  }
})();
