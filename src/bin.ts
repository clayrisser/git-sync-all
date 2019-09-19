import { handle as handleError } from '@oclif/errors/lib/handle';
import GitSyncAll from '.';

(async () => {
  try {
    await GitSyncAll.run();
  } catch (err) {
    handleError(err);
  }
})();
