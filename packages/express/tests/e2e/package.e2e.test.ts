import * as pkg from '@zistr/express';
import * as pkgMiddlewares from '@zistr/express/middlewares';

describe('E2E: Package', () => {
  it('should export express utilities and also re-export core utilities', async () => {
    expect(pkg).toBeDefined();
    expect(pkg).toHaveProperty('createExpressRouter');
    expect(pkg).toMatchSnapshot(); // Snapshot to verify all other exports
  });

  it('should export express middlewares via sub-path /middlewares', async () => {
    expect(pkgMiddlewares).toBeDefined();
    expect(pkgMiddlewares).toHaveProperty('requestContext');
    expect(pkgMiddlewares).toMatchSnapshot(); // Snapshot to verify all other exports
  });
});
