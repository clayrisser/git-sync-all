import Git from './index';
import { Logger, Config } from '../types';

export default async function clone(
  remotes: Git[],
  _config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
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
