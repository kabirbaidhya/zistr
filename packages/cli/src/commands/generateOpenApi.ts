import { Command } from 'commander';
import path from 'node:path';
import fs from 'node:fs';
import { createTsProject } from '../utils/parsing/createTsProject';
import { parseControllersFromRoutesModule } from '../utils/parsing/controllerParser';
import { buildOpenApiDocument } from '../utils/parsing/buildOpenApiDocument';
import { loadRoutesModule } from '../utils/routes';

export const generateOpenApi = new Command()
  .name('generate-open-api')
  .description('Generate OpenAPI spec from the defined routes')
  .option('--routes-module <path>', 'Path to routes module. Defaults to ./src/routes.ts or ./routes.ts')
  .action(async (opts) => {
    const { routes: routeDefinitions, resolvedPath: routesModulePath } = await loadRoutesModule(opts.routesModule);

    console.log('Got route definitions', { routeDefinitions });

    console.log('🔍 Creating ts-morph project...');
    const project = createTsProject();

    console.log('📄 Loading routes module:', routesModulePath);
    const sourceFile = project.addSourceFileAtPath(routesModulePath);

    console.log('🔍 Extracting controllers...');
    const routes = parseControllersFromRoutesModule(sourceFile, project);

    console.log('🛠 Building OpenAPI...');
    const openapi = buildOpenApiDocument(routes, routeDefinitions);

    const outputDir = path.resolve(process.cwd(), '.generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(openapi, null, 2));

    console.log('✅ OpenAPI generated at:', outputPath);
  });
