import Err from 'err';
import _ from 'lodash';
import path from 'path';
import { Logger } from '@ecosystem/core';
import { mapSeries } from 'bluebird';
import createServer from '../servers';
import Git from '../git';
import { Config, Repo } from '../types';

export default async function sync(config: Config, logger: Logger) {
  let result = '';
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
  const repos: { source: Repo; target: Repo }[] = await mapSeries(
    sourceRepos,
    async (source: Repo) => {
      const { slug } = source;
      const group = config.target.group || source.group;
      if (!(await targetServer.getRepo({ slug, group }))) {
        return {
          source,
          target: (await targetServer.createRepo({
            group,
            project: config.target.project,
            slug
          })) as Repo
        };
      }
      return {
        source,
        target: (await targetServer.getRepo({
          group,
          slug
        })) as Repo
      };
    }
  );
  const remotes: Git[] = repos.map(({ source, target }) => {
    const sourceRemote = config.ssh ? source.sshRemote : source.httpRemote;
    const targetRemote = config.ssh ? target.sshRemote : target.httpRemote;
    const directory = path.resolve(
      config.rootPath,
      '.tmp/git-sync-all',
      encodeURIComponent(sourceRemote)
    );
    return new Git(sourceRemote, targetRemote, directory);
  });
  result += await clone(remotes, config, logger);
  result += await fetch(remotes, config, logger);
  result += await merge(remotes, config, logger);
  result += await push(remotes, config, logger);
  spinner.succeed(`finished ${config.action} with ${config.source.server}`);
  return result;
}

export async function push(
  remotes: Git[],
  _config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
  const message = `branches to targets \n  - ${remotes
    .map(remote => `${remote.targetRemote}`)
    .join('\n  - ')}`;
  spinner.start(`pushing ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => {
      const branches = await remote.getBranches();
      if (branches.length) {
        await mapSeries(branches, async branch => remote.push(branch));
      }
    })
  );
  spinner.succeed(`pushing ${message}`);
  return result;
}

export async function merge(
  remotes: Git[],
  _config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
  const message = `branches \n  - ${remotes
    .map(remote => `${remote.sourceRemote} -> ${remote.targetRemote}`)
    .join('\n  - ')}`;
  spinner.start(`merging ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => {
      const branches = await remote.getBranches();
      if (branches.length) {
        await mapSeries(branches, async branch => remote.merge(branch));
      }
    })
  );
  spinner.succeed(`merged ${message}`);
  return result;
}

export async function fetch(
  remotes: Git[],
  _config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
  const message = `\n  - ${_.flatten(
    remotes.map(remote => [remote.sourceRemote, remote.targetRemote])
  ).join('\n  - ')}`;
  spinner.start(`fetching ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => (result += await remote.fetch()))
  );
  spinner.succeed(`fetched ${message}`);
  return result;
}

export async function clone(
  remotes: Git[],
  _config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
  const message = `\n  - ${remotes
    .map(remote => remote.targetRemote)
    .join('\n  - ')}`;
  spinner.start(`cloning ${message}`);
  await Promise.all(
    remotes.map(async (remote: Git) => (result += await remote.clone()))
  );
  spinner.succeed(`cloned ${message}`);
  return result;
}
