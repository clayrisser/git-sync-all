import path from 'path';
import { mapSeries } from 'bluebird';
import Git, { clone, fetch, merge, push } from '../git';
import createServer from '../servers';
import { Config } from '../config';
import { Context } from '../context';
import { Repo } from '../types';

export default async function sync(config: Config, context: Context) {
  const { rootPath, spinner } = context;
  let result = '';
  spinner.start(`started sync with ${config.source.server}`);
  const sourceServer = createServer(config.source.server, {
    username: config.source.username,
    password: config.source.password,
    token: config.source.token
  });
  if (!sourceServer) {
    throw new Error(`server '${config.source.server}' not supported`);
  }
  const targetServer = createServer(config.target.server, {
    username: config.target.username,
    password: config.target.password,
    token: config.target.token
  });
  if (!targetServer) {
    throw new Error(`server '${config.target.server}' not supported`);
  }
  const sourceRepos = (
    await sourceServer.getRepos({
      owned: config.source.owned
    })
  ).filter((repo: Repo) => {
    const { blacklist, whitelist, slugRegex, groups } = config.source;
    const repoPath = `${repo.group}/${repo.slug}`;
    return (
      (!groups.size || groups.has(repo.group)) &&
      (((slugRegex
        ? slugRegex.test(repo.slug) || slugRegex.test(repoPath)
        : true) &&
        !blacklist.has(repo.slug) &&
        !blacklist.has(repoPath)) ||
        whitelist.has(repo.slug) ||
        whitelist.has(repoPath))
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
      rootPath,
      '.tmp/git-sync-all',
      encodeURIComponent(sourceRemote)
    );
    return new Git(sourceRemote, targetRemote, directory);
  });
  result += await clone(remotes, config, context);
  result += await fetch(remotes, config, context);
  result += await merge(remotes, config, context);
  result += await push(remotes, config, context);
  spinner.succeed(`finished sync with ${config.source.server}`);
  return result;
}
