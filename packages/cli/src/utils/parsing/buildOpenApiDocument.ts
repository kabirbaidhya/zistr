import { Type } from 'ts-morph';
import { RouteDefinition } from '@zistr/core';
import { ParsedRouteController } from './controllerParser';
import { resolveTypeSchema } from './schemaResolver';

/**
 * Unwrap Promise and ControllerResult types to get the actual response body type
 */
function extractResponseType(type: Type): Type {
  // unwrap Promise<T>
  if (type.getSymbol()?.getName() === 'Promise') {
    const typeArgs = type.getTypeArguments();
    if (typeArgs.length === 1) type = typeArgs[0];
  }

  // unwrap ControllerResult<T>
  if (type.getSymbol()?.getName() === 'ControllerResult') {
    const typeArgs = type.getTypeArguments();
    return typeArgs.length === 1 ? typeArgs[0] : type.getApparentType();
  }

  // fallback to apparent type to avoid empty schemas
  return type.getApparentType();
}

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

    // handle parameters and request body
    for (const p of method.params) {
      if (p.decorator === 'ReqBody') {
        requestBody = {
          required: true,
          description: p.jsDoc,
          content: {
            'application/json': {
              schema: resolveTypeSchema(p.type, { ignoreMethods: true }),
            },
          },
        };
      } else if (p.decorator === 'Params' || p.decorator === 'Query') {
        parameters.push({
          name: p.name,
          in: p.decorator === 'Params' ? 'path' : 'query',
          required: p.decorator === 'Params',
          schema: resolveTypeSchema(p.type, { ignoreMethods: true }),
        });
      }
    }

    if (!paths[routePath]) paths[routePath] = {};

    // handle response schema
    const responseType = extractResponseType(method.returnType);
    const responseSchema = resolveTypeSchema(responseType, { ignoreMethods: true });

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
              schema: responseSchema,
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
