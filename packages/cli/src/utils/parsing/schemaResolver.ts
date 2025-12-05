import { Type, Symbol } from 'ts-morph';

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  $ref?: string;
}

export interface ResolveSchemaOptions {
  /** Whether to ignore methods when building object schemas */
  ignoreMethods?: boolean;
}

export function resolveTypeSchema(type: Type, opts?: { ignoreMethods?: boolean }): SchemaObject {
  if (type.isString()) return { type: 'string' };
  if (type.isNumber()) return { type: 'number' };
  if (type.isBoolean()) return { type: 'boolean' };

  if (type.isArray()) {
    const elem = type.getArrayElementTypeOrThrow();
    return { type: 'array', items: resolveTypeSchema(elem, opts) };
  }

  if (type.isObject()) {
    const props: Record<string, SchemaObject> = {};
    for (const prop of type.getProperties()) {
      const decl = prop.getValueDeclaration();
      if (!decl) continue;

      const propType = decl.getType();

      // skip methods if requested
      if (opts?.ignoreMethods && propType.getCallSignatures().length > 0) continue;

      props[prop.getName()] = resolveTypeSchema(propType, opts);
    }
    return { type: 'object', properties: props };
  }

  return { type: 'string' }; // fallback
}

// function resolveObjectSchema(type: Type, options: ResolveSchemaOptions = {}): Record<string, SchemaObject> {
//   const props = type.getProperties();
//   const out: Record<string, SchemaObject> = {};

//   for (const prop of props) {
//     // Skip methods if ignoreMethods option is true
//     const decl = prop.getValueDeclaration();
//     if (!decl) continue;

//     if (options.ignoreMethods && decl.getKindName?.() === 'MethodDeclaration') continue;

//     const propType = decl.getType();
//     out[prop.getName()] = resolveTypeSchema(propType, options);
//   }

//   return out;
// }
