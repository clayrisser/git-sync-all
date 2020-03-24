import { mapSeries } from 'bluebird';
import Git from './index';
import { Context } from '../context';
import { Config } from '../config';

export default async function merge(
  remotes: Git[],
  _config: Config,
  { spinner }: Context
): Promise<string> {
  const result = '';
  const message = `branches \n  - ${remotes
    .map((remote) => `${remote.sourceRemote} -> ${remote.targetRemote}`)
    .join('\n  - ')}`;
  spinner.start(`merging ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => {
      const branches = await remote.getBranches();
      if (branches.length) {
        await mapSeries(branches, async (branch) => remote.merge(branch));
      }
    })
  );
  spinner.succeed(`merged ${message}`);
  return result;
}
