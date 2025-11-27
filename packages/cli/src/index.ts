import { Command } from 'commander';
import { listRoutes } from './commands/listRoutes';

import packageJson from '../package.json';

async function main() {
  const program = new Command();

  program.name('zistr').description(packageJson.description).version(packageJson.version);

  program.addCommand(listRoutes);

  try {
    await program.parseAsync();
  } catch (err) {
    console.error('❌ Error:', (err instanceof Error ? err.message : err) || 'An error occurred.');
    process.exit(1);
  }
}

main();
