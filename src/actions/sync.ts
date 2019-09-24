import Err from 'err';
import { Logger } from '@ecosystem/core';
import createServer from '../servers';
import { Config } from '../types';

export default async function sync(config: Config, logger: Logger) {
  const spinner = logger.spinner.start(
    `started ${config.action} with ${config.server}`
  );
  const server = createServer(config.server, { token: config.token });
  if (!server) throw new Err(`server '${config.server}' not supported`, 400);
  const repos = await server.getRepos();
  let remotes = [];
  if (config.ssh) {
    remotes = repos.map(r => r.sshRemote);
  } else {
    remotes = repos.map(r => r.httpRemote);
  }
  spinner.succeed(`finished ${config.action} with ${config.server}`);
  logger.info(remotes);
}
