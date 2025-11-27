import { Command } from 'commander';
import type { RouteDefinition } from '@zistr/core';

import { loadRoutesModule } from '../utils/routes';

export const listRoutes = new Command()
  .name('list-routes')
  .description('List all registered routes')
  .option('--routes-module <path>', 'Path to routes module. Defaults to ./src/routes.ts or ./routes.ts')
  .action(async (opts) => {
    const routes: RouteDefinition[] = await loadRoutesModule(opts.routesModule);

    console.log('');
    console.table(
      routes.map((r) => ({
        Method: r.requestMethod,
        Path: r.path,
        Handler: `${r.controllerName}.${r.methodName}`,
      }))
    );

    console.log('Total routes:', routes.length);
  });
