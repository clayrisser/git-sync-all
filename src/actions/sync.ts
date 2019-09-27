import Err from 'err';
import fs from 'fs-extra';
import path from 'path';
import { Logger } from '@ecosystem/core';
import { mapSeries } from 'bluebird';
import createServer from '../servers';
import Git from '../git';
import { Config, Repo } from '../types';

export interface RemotePair {
  sourceRemote: string;
  targetRemote: string;
}

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
  let remotes: RemotePair[] = [];
  if (config.ssh) {
    remotes = repos.map(({ source, target }) => ({
      sourceRemote: source.sshRemote,
      targetRemote: target.sshRemote
    }));
  } else {
    remotes = repos.map(({ source, target }) => ({
      sourceRemote: source.httpRemote,
      targetRemote: target.httpRemote
    }));
  }
  result += await clone(remotes, config, logger);
  spinner.succeed(`finished ${config.action} with ${config.source.server}`);
  return result;
}

export async function clone(
  remotes: RemotePair[],
  config: Config,
  logger: Logger
): Promise<string> {
  let result = '';
  const { spinner } = logger;
  spinner.start(
    `cloning ${remotes.map(remote => remote.targetRemote).join('\n')}`
  );
  await Promise.all(
    remotes.map(async ({ sourceRemote, targetRemote }) => {
      const directory = path.resolve(
        config.rootPath,
        '.tmp/git-sync-all',
        encodeURIComponent(sourceRemote)
      );
      if (await fs.pathExists(directory)) {
        return spinner.warn(`already cloned ${sourceRemote}`);
      }
      const git = new Git(sourceRemote, targetRemote, directory);
      result += await git.clone();
      await new Promise(r => setTimeout(r, 3000));
      return spinner.succeed(`cloned ${sourceRemote}`);
    })
  );
  return result;
}
