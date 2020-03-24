import ora, { Ora } from 'ora';
import { SPLAT } from 'triple-beam';
import pkgDir from 'pkg-dir';
import winston from 'winston';

export interface Context {
  logger: typeof winston;
  rootPath: string;
  spinner: Ora;
}

function createLogString(args: any[]): string {
  return args
    .map((arg: any) => {
      if (Array.isArray(arg) || arg.toString() === '[object Object]') {
        return JSON.stringify(arg, null, 4);
      }
      return arg.toString();
    })
    .join(' ');
}

winston.configure({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info: { level: string; message: string; [key: string]: any }) => {
            const date = new Date().toISOString();
            const { level, message } = info;
            const args: any[] = [message, ...info[SPLAT]];
            return `${date} [${level}]: ${createLogString(args)}\n`;
          }
        )
      ),
      level: 'debug'
    })
  ]
});

export function createContext(): Context {
  return {
    logger: winston,
    rootPath: pkgDir.sync(process.cwd()) || process.cwd(),
    spinner: ora()
  };
}
