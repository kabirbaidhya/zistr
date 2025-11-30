import * as pkg from '@zistr/core';

describe('E2E: Package', () => {
  it('should export core utilities', async () => {
    expect(pkg).toBeDefined();
    expect(pkg).toMatchSnapshot();
  });
});
