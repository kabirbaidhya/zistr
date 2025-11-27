import path from 'node:path';

import { outputOf, runCLI } from './helpers';

const STUBS = path.resolve(__dirname, './stubs');

describe('E2E: list-routes command', () => {
  it('should fail if the routes module does not exist', () => {
    const result = runCLI(['list-routes', '--routes-module', 'nonexistent.ts']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Could not resolve the routes module.');
  });

  it('should fail if the module does not export routes', () => {
    const filePath = path.join(STUBS, 'routes-invalid-no-export.ts');
    const result = runCLI(['list-routes', '--routes-module', filePath]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not export routes');
  });

  it('should fail if the module exports routes but not of routes array', () => {
    const filePath = path.join(STUBS, 'routes-invalid-routes-value.ts');
    const result = runCLI(['list-routes', '--routes-module', filePath]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('exports invalid routes.');
  });

  it('should succeed and print routes for a valid route module', () => {
    const filePath = path.join(STUBS, 'routes-valid.ts');
    const result = runCLI(['list-routes', '--routes-module', filePath]);

    expect(result.status).toBe(0);
    expect(outputOf(result)).toMatchSnapshot();
    expect(result.stderr).toBe('');
  });

  it('should succeed for a valid route module consisting of more imported TS files', () => {
    const filePath = path.join(STUBS, 'routes-with-valid-imported-ts-controllers.ts');
    const result = runCLI(['list-routes', '--routes-module', filePath]);

    expect(result.status).toBe(0);
    expect(outputOf(result)).toMatchSnapshot();
    expect(result.stderr).toBe('');
  });
});
