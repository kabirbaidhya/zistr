import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RouteDefinition } from '@zistr/core';

const DEFAULT_LOCATIONS = ['./src/routes.ts', './routes.ts'];

export async function loadRoutesModule(customPath?: string): Promise<RouteDefinition[]> {
  let modulePath = customPath;

  if (!modulePath) {
    for (const loc of DEFAULT_LOCATIONS) {
      try {
        await import(pathToFileURL(path.resolve(loc)).href);
        modulePath = loc;
        break;
      } catch {
        modulePath = undefined;
      }
    }
  }

  if (!modulePath) {
    throw new Error('Could not resolve the routes module.');
  }

  const resolved = pathToFileURL(path.resolve(modulePath)).href;
  const mod = await import(resolved);

  if (!mod.routes) {
    throw new Error(`The provided module "${modulePath}" does not export 'routes'.`);
  }

  return mod.routes as RouteDefinition[];
}
