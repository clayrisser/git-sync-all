import GitLab from './gitlab';
import BitBucket from './bitbucket';
import Server, { ServerConfig } from './server';

export default function createServer(
  name: string,
  serverConfig: ServerConfig
): Server | void {
  return ((name: string): Server | void =>
    (({
      gitlab: new GitLab(serverConfig),
      bitbucket: new BitBucket(serverConfig)
    } as { [key: string]: Server | void })[name]))(name);
}
export { Server, ServerConfig };
