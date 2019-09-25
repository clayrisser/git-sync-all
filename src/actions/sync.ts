import Err from 'err';
import { Logger } from '@ecosystem/core';
import { mapSeries } from 'bluebird';
import createServer from '../servers';
import { Config, Repo } from '../types';

export default async function sync(config: Config, logger: Logger) {
  const spinner = logger.spinner.start(
    `started ${config.action} with ${config.source.server}`
  );
  const sourceServer = createServer(config.source.server, {
    username: config.source.username,
    password: config.source.password,
    token: config.source.token
  });
  if (!sourceServer) {
    throw new Err(`server '${config.source.server}' not supported`, 400);
  }
  const targetServer = createServer(config.target.server, {
    username: config.target.username,
    password: config.target.password,
    token: config.target.token
  });
  if (!targetServer) {
    throw new Err(`server '${config.target.server}' not supported`, 400);
  }
  const sourceRepos = (await sourceServer.getRepos({
    owned: config.source.owned
  })).filter((repo: Repo) => {
    const { blacklist, whitelist, slugRegex, groups } = config.source;
    const repoPath = `${repo.group}/${repo.slug}`;
    return (
      (!groups.size || groups.has(repo.group)) &&
      (((slugRegex
        ? slugRegex.test(repo.slug) || slugRegex.test(repoPath)
        : true) &&
        (!blacklist.has(repo.slug) && !blacklist.has(repoPath))) ||
        (whitelist.has(repo.slug) || whitelist.has(repoPath)))
    );
  });
  await mapSeries(sourceRepos, async (sourceRepo: Repo) => {
    const { slug } = sourceRepo;
    const group = config.target.group || sourceRepo.group;
    if (!(await targetServer.getRepo({ slug, group }))) {
      return targetServer.createRepo({
        group,
        project: config.target.project,
        slug
      });
    }
    return sourceRepo;
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
