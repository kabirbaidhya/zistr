import { Type } from 'ts-morph';
import { ParamType, RouteDefinition, ControllerResultSymbol } from '@zistr/core';
import { ParsedRouteController } from './controllerParser';
import { resolveTypeSchema } from './schemaResolver';

/**
 * Unwrap Promise<T> and ControllerResult<T> to get the actual response body type
 */
function extractResponseType(type: Type): Type {
  const symbol = type.getSymbol();

  // unwrap native Promise<T>
  if (symbol) {
    const fqName = symbol.getFullyQualifiedName();
    if (fqName === 'Promise' || fqName === 'global.Promise') {
      const typeArgs = type.getTypeArguments();
      if (typeArgs.length === 1) type = typeArgs[0];
    }
  }

  // unwrap ControllerResult<T> (type-only) using symbol
  if (symbol === ControllerResultSymbol) {
    const typeArgs = type.getTypeArguments();
    return typeArgs.length === 1 ? typeArgs[0] : type.getApparentType();
  }

  // fallback to apparent type
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

    const method = ctrl.methodMap.get(methodName);
    if (!method) {
      console.warn(`⚠️ Method ${methodName} not found in controller ${controllerName}`);
      continue;
    }

    // Map AST parameter name → Type & JSDoc for quick lookup
    const astParamMap = new Map(
      method.methodDecl.getParameters().map((p) => [
        p.getName(),
        {
          type: p.getType(),
          jsDoc: p
            .getJsDocs()
            .map((d) => d.getComment() ?? '')
            .join('\n'),
        },
      ])
    );

    const parameters: OpenApiParameter[] = [];
    let requestBody: OpenApiOperation['requestBody'];

    // Use RouteDefinition param info for decorator/type
    for (const p of route.params) {
      const astParam = method.methodDecl.getParameters()[p.index];
      if (!astParam) continue;

      const { type, jsDoc } = astParamMap.get(astParam.getName())!;

      if (p.type === ParamType.BODY) {
        requestBody = {
          required: true,
          description: jsDoc,
          content: {
            'application/json': {
              schema: resolveTypeSchema(type, { ignoreMethods: true }),
            },
          },
        };
      } else if (p.type === ParamType.PARAMS || p.type === ParamType.QUERY) {
        parameters.push({
          name: astParam.getName(),
          in: p.type === ParamType.PARAMS ? 'path' : 'query',
          required: p.type === ParamType.PARAMS,
          schema: resolveTypeSchema(type, { ignoreMethods: true }),
        });
      }
      // Other ParamTypes (REQUEST, REQUEST_CONTEXT) are ignored for OpenAPI
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
