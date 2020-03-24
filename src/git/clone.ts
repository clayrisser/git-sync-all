import Git from './index';
import { Context } from '../context';
import { Config } from '../config';

export default async function clone(
  remotes: Git[],
  _config: Config,
  { spinner }: Context
): Promise<string> {
  let result = '';
  const message = `\n  - ${remotes
    .map((remote) => remote.targetRemote)
    .join('\n  - ')}`;
  spinner.start(`cloning ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => (result += await remote.clone()))
  );
  spinner.succeed(`cloned ${message}`);
  return result;
}
