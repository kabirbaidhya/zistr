import { getRouteDefinitions, RouteDefinition } from '@zistr/core';

import { OrdersController, SimpleController } from './dummy/controllers';

export const routes: RouteDefinition[] = getRouteDefinitions([OrdersController, SimpleController]);
