import GitLab from './gitlab';
import Server, { ServerConfig } from './server';

export default function createServer(
  name: string,
  serverConfig: ServerConfig
): Server | null {
  if (name === 'gitlab') {
    return new GitLab(serverConfig);
  }
  return null;
}
export { Server, ServerConfig };
