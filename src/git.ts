import crossSpawn from 'cross-spawn';
import Err from 'err';
import { SpawnOptions } from 'child_process';

export async function spawn(
  command: string,
  args?: string[],
  options?: SpawnOptions
): Promise<string> {
  options = {
    stdio: 'pipe',
    ...(options || {})
  };
  return new Promise((resolve, reject) => {
    const ps = crossSpawn(command, args, options);
    let result = '';
    if (!ps.stdout || !ps.stderr) return reject(new Err('process not spawned'));
    ps.stdout.on('data', data => (result += data.toString()));
    ps.stderr.on('data', data => (result += data.toString()));
    ps.on('close', () => resolve(result));
    ps.on('error', (err: Error) => reject(err));
    return null;
  });
}

export default class Git {
  constructor(
    public sourceRemote: string,
    public targetRemote: string,
    public directory: string
  ) {}

  async clone(): Promise<string> {
    let result = '';
    result += await spawn('git', ['clone', this.sourceRemote, this.directory]);
    const cwd = process.cwd();
    process.chdir(this.directory);
    result += await spawn('git', ['remote', 'rename', 'origin', 'source']);
    result += await spawn('git', [
      'remote',
      'add',
      'target',
      this.targetRemote
    ]);
    process.chdir(cwd);
    return result;
  }

  async fetch() {
    const cwd = process.cwd();
    process.chdir(this.directory);
    await spawn('git', ['fetch', 'source']);
    await spawn('git', ['fetch', 'target']);
    process.chdir(cwd);
  }

  async merge() {
    const cwd = process.cwd();
    process.chdir(this.directory);
    await spawn('git', ['merge', 'source']);
    await spawn('git', ['merge', 'target']);
    process.chdir(cwd);
  }

  async getBranches() {
    const cwd = process.cwd();
    process.chdir(this.directory);
    await spawn('git', ['--no-pager', 'branch']);
    process.chdir(cwd);
  }

  async push(branch = 'master', force = false) {
    const cwd = process.cwd();
    process.chdir(this.directory);
    await spawn('git', ['push', 'target', branch, ...(force ? ['-f'] : [])]);
    process.chdir(cwd);
  }
}
