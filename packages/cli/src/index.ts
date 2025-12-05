import { Command } from 'commander';

import packageJson from '../package.json';
import { listRoutes } from './commands/listRoutes';
import { generateOpenApi } from './commands/generateOpenApi';

async function main() {
  const program = new Command();

  try {
    program.name('zistr').description(packageJson.description).version(packageJson.version);

    program.addCommand(listRoutes);
    program.addCommand(generateOpenApi);

    await program.parseAsync();
    // process.exit(0);
  } catch (err) {
    console.error('❌ Error:', (err instanceof Error ? err.message : err) || 'An error occurred.');
    // process.exit(1);
  }
}

main();
