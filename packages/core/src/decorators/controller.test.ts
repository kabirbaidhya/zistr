import { Controller } from './controller';
import { getBasePath, getRoutes } from './metadata';

describe('Decorators: Controller', () => {
  it('should store base path metadata on controller class', () => {
    @Controller('/api')
    class MyController {}

    const basePath = getBasePath(MyController);
    expect(basePath).toBe('/api');
  });

  it('should initialize routes metadata on controller if not present', () => {
    @Controller('/api')
    class MyController {}

    const routes = getRoutes(MyController);
    expect(routes).toEqual([]);
  });
});
