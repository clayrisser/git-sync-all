import execa from 'execa';
import clone from './clone';
import fetch from './fetch';
import merge from './merge';
import push from './push';

export default class Git {
  constructor(
    public sourceRemote: string,
    public targetRemote: string,
    public directory: string
  ) {}

  async clone(): Promise<string> {
    let result = '';
    result +=
      (await execa('git', ['clone', this.sourceRemote, this.directory]))
        .stdout || '';
    process.chdir(this.directory);
    result +=
      (
        await execa('git', ['remote', 'rename', 'origin', 'source'], {
          cwd: this.directory
        })
      ).stdout || '';
    result +=
      (
        await execa('git', ['remote', 'add', 'target', this.targetRemote], {
          cwd: this.directory
        })
      ).stdout || '';
    return result;
  }

  async fetch(): Promise<string> {
    let result = '';
    process.chdir(this.directory);
    result +=
      (await execa('git', ['fetch', 'source'], { cwd: this.directory }))
        .stdout || '';
    result +=
      (await execa('git', ['fetch', 'target'], { cwd: this.directory }))
        .stdout || '';
    return result;
  }

  async merge(branch: string): Promise<string> {
    let result = '';
    process.chdir(this.directory);
    result +=
      (await execa('git', ['checkout', branch], { cwd: this.directory }))
        .stdout || '';
    result +=
      (
        await execa('git', ['merge', `remotes/source/${branch}`], {
          cwd: this.directory
        })
      ).stdout || '';
    return result;
  }

  async getBranches(): Promise<string[]> {
    process.chdir(this.directory);
    const result =
      (
        await execa('git', ['--no-pager', 'branch', '-a'], {
          cwd: this.directory
        })
      ).stdout || '';
    return result
      .split('\n')
      .map((branch: string) => branch.substr(2))
      .filter((branch) => /^remotes\/source\/[^\s]+$/.test(branch))
      .map(
        (branch: string) => branch.match(/(?<=remotes\/source\/).+$/)?.[0] || ''
      )
      .filter((branch) => branch.length);
  }

  async push(branch = 'master', force = false): Promise<string> {
    let result = '';
    result += await execa('git', ['checkout', branch], { cwd: this.directory });
    result += await execa(
      'git',
      ['push', 'target', branch, ...(force ? ['-f'] : [])],
      { cwd: this.directory }
    );
    return result;
  }
}

export { clone, fetch, merge, push };
