import Git from './index';
import { Logger, Config } from '../types';

export default async function fetch(
  remotes: Git[],
  _config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
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
