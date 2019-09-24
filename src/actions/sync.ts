import Err from 'err';
import { Logger } from '@ecosystem/core';
import createServer from '../servers';
import { Config, Repo } from '../types';

export default async function sync(config: Config, logger: Logger) {
  const spinner = logger.spinner.start(
    `started ${config.action} with ${config.source.server}`
  );
  const server = createServer(config.source.server, {
    clientId: config.source.clientId,
    clientSecret: config.source.clientSecret,
    token: config.source.token
  });
  if (!server)
    throw new Err(`server '${config.source.server}' not supported`, 400);
  const repos = (await server.getRepos()).filter((repo: Repo) => {
    return !!repo;
    // config.source.blacklist;

    // blacklist?: string[];
    // groups: string[];
    // slugRegex?: RegExp;
    // whitelist?: string[];
  });
  let remotes = [];
  if (config.ssh) {
    remotes = repos.map((r: Repo) => r.sshRemote);
  } else {
    remotes = repos.map((r: Repo) => r.httpRemote);
  }
  spinner.succeed(`finished ${config.action} with ${config.source.server}`);
  logger.info(remotes);
}
