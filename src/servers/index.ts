import BitBucket from './bitbucket';
import GitHub from './github';
import GitLab from './gitlab';
import Server, { ServerConfig } from './server';
import { Config } from '../config';

export default function createServer(
  name: string,
  serverConfig: ServerConfig,
  config: Config
): Server | void {
  return ((name: string): Server | void =>
    (({
      bitbucket: new BitBucket(serverConfig, config),
      github: new GitHub(serverConfig, config),
      gitlab: new GitLab(serverConfig, config)
    } as { [key: string]: Server | void })[name]))(name);
}
export { Server, ServerConfig };
