import Err from 'err';
import createServer from '../servers';
import { Config } from '../types';

export default async function sync(config: Config) {
  const server = createServer(config.server, { token: config.token });
  if (!server) throw new Err(`server '${config.server}' not supported`, 400);
  const repos = await server.getRepos();
  let remotes = [];
  if (config.ssh) {
    remotes = repos.map(r => r.sshRemote);
  } else {
    remotes = repos.map(r => r.httpRemote);
  }
  console.log(remotes);
}
