import Git from './index';
import { Context } from '../context';
import { Config } from '../config';

export default async function fetch(
  remotes: Git[],
  _config: Config,
  { spinner }: Context
): Promise<string> {
  let result = '';
  const message = `\n  - ${remotes
    .map((remote) => [remote.sourceRemote, remote.targetRemote])
    .flat()
    .join('\n  - ')}`;
  spinner.start(`fetching ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => (result += await remote.fetch()))
  );
  spinner.succeed(`fetched ${message}`);
  return result;
}
