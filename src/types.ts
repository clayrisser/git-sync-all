import flags from '@oclif/command/lib/flags';

export type Flags = flags.Input<any>;

export interface Repo {
  detail: object;
  group: string;
  httpRemote: string;
  name: string;
  slug: string;
  sshRemote: string;
}
