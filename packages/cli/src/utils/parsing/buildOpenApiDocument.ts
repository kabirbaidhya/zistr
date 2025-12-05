import { ParsedRouteController } from './controllerParser';
import { resolveTypeSchema } from './schemaResolver';

import { RouteDefinition } from '@zistr/core';

interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required?: boolean;
  schema: any;
}

interface OpenApiResponse {
  description: string;
  content?: {
    [media: string]: {
      schema: any;
    };
  };
}

interface OpenApiOperation {
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content: {
      [media: string]: {
        schema: any;
      };
    };
  };
  responses: Record<string, OpenApiResponse>;
}

interface OpenApiPaths {
  [path: string]: {
    [method in 'get' | 'post' | 'put' | 'delete' | 'patch']?: OpenApiOperation;
  };
}

interface OpenApiDocument {
  openapi: '3.1.0';
  info: {
    title: string;
    version: string;
  };
  paths: OpenApiPaths;
}

export function buildOpenApiDocument(
  controllers: ParsedRouteController[],
  routeDefinitions: RouteDefinition[]
): OpenApiDocument {
  const paths: OpenApiPaths = {};

  // Map controllers for O(1) lookup
  const controllerMap = new Map<string, ParsedRouteController>();
  for (const ctrl of controllers) {
    const methodMap = new Map(ctrl.methods.map((m) => [m.name, m]));
    controllerMap.set(ctrl.className, { ...ctrl, methodMap } as ParsedRouteController & {
      methodMap: Map<string, (typeof ctrl.methods)[0]>;
    });
  }

  for (const route of routeDefinitions) {
    const { path: routePath, requestMethod, controllerName, methodName } = route;

    const ctrl = controllerMap.get(controllerName);
    if (!ctrl) {
      console.warn(`⚠️ Controller not found for route ${routePath}`);
      continue;
    }

    const method = (ctrl as any).methodMap.get(methodName);
    if (!method) {
      console.warn(`⚠️ Method ${methodName} not found in controller ${controllerName}`);
      continue;
    }

    const parameters: OpenApiParameter[] = [];
    let requestBody: OpenApiOperation['requestBody'];

    // Detect parameter type from decorator: assume name + type from ts-morph
    for (const p of method.params) {
      const name = p.name;
      const schema = resolveTypeSchema(p.type);

      if (name === 'body' || p.jsDoc?.toLowerCase().includes('@reqbody')) {
        requestBody = {
          required: true,
          description: p.jsDoc,
          content: {
            'application/json': {
              schema,
            },
          },
        };
      } else if (name === 'params') {
        // Path parameters
        const pathParamMatches = routePath.match(/:([a-zA-Z0-9_]+)/g);
        if (pathParamMatches) {
          pathParamMatches.forEach((param) => {
            parameters.push({
              name: param.slice(1),
              in: 'path',
              required: true,
              schema: { type: 'string' },
            });
          });
        }
      } else {
        // Default to query parameter
        parameters.push({
          name,
          in: 'query',
          schema,
        });
      }
    }

    if (!paths[routePath]) paths[routePath] = {};

    paths[routePath][requestMethod.toLowerCase() as keyof OpenApiPaths[string]] = {
      summary: method.jsDoc?.split('\n')[0],
      description: method.jsDoc,
      parameters: parameters.length ? parameters : undefined,
      requestBody,
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: resolveTypeSchema(method.returnType),
            },
          },
        },
      },
    };
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Generated API',
      version: '1.0.0',
    },
    paths,
  };
}
