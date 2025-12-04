import fs from 'node:fs';
import path from 'node:path';
import { register } from 'ts-node';
import type { RouteDefinition } from '@zistr/core';

const DEFAULT_LOCATIONS = ['./src/routes.ts', './routes.ts'];

// Register ts-node once so we can import TS files dynamically
register({ transpileOnly: true });

/**
 * Resolves routes module path. Throws if no routes module could be located.
 */
function resolveRoutesModulePath(customPath?: string): string {
  const candidates = customPath ? [customPath] : DEFAULT_LOCATIONS;

  for (const filePath of candidates) {
    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  throw new Error('Could not resolve the routes module. Please provide a valid path via `--routes-module` option.');
}

/**
 * Loads a module exporting `routes: RouteDefinition[]`.
 * Throws if the module doesn't exist or exports invalid data.
 */
export async function loadRoutesModule(customPath?: string): Promise<RouteDefinition[]> {
  const resolvedPath = resolveRoutesModulePath(customPath);

  // IMPORTANT: Dynamic require to support both JS and TS route modules
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(resolvedPath);

  if (!('routes' in module)) {
    throw new Error(`Routes module "${resolvedPath}" does not export routes.`);
  }

  if (!Array.isArray(module.routes)) {
    throw new Error(`Routes module "${resolvedPath}" exports invalid routes.`);
  }

  return module.routes as RouteDefinition[];
}
