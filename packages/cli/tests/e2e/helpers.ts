import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Path to the actual CLI executable (bin/zistr)
const CLI_EXEC = path.resolve(__dirname, '../../bin/zistr');

export const runCLI = (args: string[] = []) => {
  return spawnSync(CLI_EXEC, args, {
    encoding: 'utf-8',
    shell: true, // <- important: allows executing shebang scripts directly.
  });
};

export const outputOf = ({ status, stderr, stdout }: ReturnType<typeof runCLI>) => ({ status, stdout, stderr });
