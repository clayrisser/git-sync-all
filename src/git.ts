import Err from 'err';
import crossSpawn from 'cross-spawn';
import { SpawnOptions } from 'child_process';
import { oc } from 'ts-optchain.macro';

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

  async fetch(): Promise<string> {
    let result = '';
    const cwd = process.cwd();
    process.chdir(this.directory);
    result += await spawn('git', ['fetch', 'source']);
    result += await spawn('git', ['fetch', 'target']);
    process.chdir(cwd);
    return result;
  }

  async merge(branch: string): Promise<string> {
    let result = '';
    const cwd = process.cwd();
    process.chdir(this.directory);
    result += await spawn('git', ['checkout', branch]);
    result += await spawn('git', ['merge', `remotes/source/${branch}`]);
    process.chdir(cwd);
    return result;
  }

  async getBranches(): Promise<string[]> {
    const cwd = process.cwd();
    process.chdir(this.directory);
    const result = await spawn('git', ['--no-pager', 'branch', '-a']);
    process.chdir(cwd);
    return result
      .split('\n')
      .map((branch: string) => branch.substr(2))
      .filter(branch => /^remotes\/source\/[^\s]+$/.test(branch))
      .map((branch: string) =>
        oc(branch.match(/(?<=remotes\/source\/).+$/))[0]('')
      )
      .filter(branch => branch.length);
  }

  async push(branch = 'master', force = false): Promise<string> {
    const cwd = process.cwd();
    process.chdir(this.directory);
    const result = await spawn('git', [
      'push',
      'target',
      branch,
      ...(force ? ['-f'] : [])
    ]);
    process.chdir(cwd);
    return result;
  }
}
