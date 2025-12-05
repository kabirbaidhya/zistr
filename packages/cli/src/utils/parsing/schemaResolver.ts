import { Type, Symbol } from 'ts-morph';

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  $ref?: string;
}

export function resolveTypeSchema(type: Type): SchemaObject {
  if (type.isString()) return { type: 'string' };
  if (type.isNumber()) return { type: 'number' };
  if (type.isBoolean()) return { type: 'boolean' };

  if (type.isArray()) {
    const elem = type.getArrayElementTypeOrThrow();
    return {
      type: 'array',
      items: resolveTypeSchema(elem),
    };
  }

  if (type.isObject() && !type.isAnonymous()) {
    return {
      type: 'object',
      properties: resolveObjectSchema(type),
    };
  }

  return { type: 'string' }; // fallback
}

function resolveObjectSchema(type: Type): Record<string, SchemaObject> {
  const props = type.getProperties();
  const out: Record<string, SchemaObject> = {};

  for (const prop of props) {
    const decl = prop.getValueDeclaration();
    if (!decl) continue;

    const propType = decl.getType();
    out[prop.getName()] = resolveTypeSchema(propType);
  }

  return out;
}
