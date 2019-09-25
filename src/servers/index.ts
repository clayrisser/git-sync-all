import BitBucket from './bitbucket';
import GitHub from './github';
import GitLab from './gitlab';
import Server, { ServerConfig } from './server';

export default function createServer(
  name: string,
  serverConfig: ServerConfig
): Server | void {
  return ((name: string): Server | void =>
    (({
      bitbucket: new BitBucket(serverConfig),
      github: new GitHub(serverConfig),
      gitlab: new GitLab(serverConfig)
    } as { [key: string]: Server | void })[name]))(name);
}
export { Server, ServerConfig };
