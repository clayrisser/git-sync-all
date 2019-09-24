import Err from 'err';
import { Logger } from '@ecosystem/core';
import createServer from '../servers';
import { Config, Repo } from '../types';

export default async function sync(config: Config, logger: Logger) {
  const spinner = logger.spinner.start(
    `started ${config.action} with ${config.server}`
  );
  const server = createServer(config.server, {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    token: config.token
  });
  if (!server) throw new Err(`server '${config.server}' not supported`, 400);
  const repos = await server.getRepos().catch(logger.info);
  let remotes = [];
  if (config.ssh) {
    remotes = repos.map((r: Repo) => r.sshRemote);
  } else {
    remotes = repos.map((r: Repo) => r.httpRemote);
  }
  spinner.succeed(`finished ${config.action} with ${config.server}`);
  logger.info(remotes);
}
