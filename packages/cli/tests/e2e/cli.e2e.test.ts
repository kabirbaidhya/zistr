import { runCLI } from './helpers';

import packageJson from '../../package.json';

describe('Zistr CLI E2E', () => {
  it('should run the CLI executable directly without crashing', () => {
    const result = runCLI();
    expect([0, 1]).toContain(result.status);
  });

  it('should display help with --help', () => {
    const result = runCLI(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Usage: zistr/);
    expect(result.stderr).toBe('');
  });

  it('should display the correct version with --version', () => {
    const version = packageJson.version;

    const result = runCLI(['--version']);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(version);
    expect(result.stderr).toBe('');
  });
});
