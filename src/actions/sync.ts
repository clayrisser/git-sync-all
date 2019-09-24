import Err from 'err';
import { Logger } from '@ecosystem/core';
import createServer from '../servers';
import { Config, Repo } from '../types';

export default async function sync(config: Config, logger: Logger) {
  const spinner = logger.spinner.start(
    `started ${config.action} with ${config.source.server}`
  );
  const sourceServer = createServer(config.source.server, {
    clientId: config.source.clientId,
    clientSecret: config.source.clientSecret,
    token: config.source.token
  });
  if (!sourceServer) {
    throw new Err(`server '${config.source.server}' not supported`, 400);
  }
  const sourceRepos = (await sourceServer.getRepos({
    owned: config.source.owned
  })).filter((repo: Repo) => {
    const { blacklist, whitelist, slugRegex, groups } = config.source;
    return (
      (!groups.size || groups.has(repo.group)) &&
      (((slugRegex ? slugRegex.test(repo.slug) : true) &&
        !blacklist.has(repo.slug)) ||
        whitelist.has(repo.slug))
    );
  });
  let sourceRemotes = [];
  if (config.ssh) {
    sourceRemotes = sourceRepos.map((r: Repo) => r.sshRemote);
  } else {
    sourceRemotes = sourceRepos.map((r: Repo) => r.httpRemote);
  }
  spinner.succeed(`finished ${config.action} with ${config.source.server}`);
  logger.info(sourceRemotes);
}
