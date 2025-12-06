import {
  Project,
  SourceFile,
  ArrayLiteralExpression,
  ClassDeclaration,
  SyntaxKind,
  MethodDeclaration,
  Type,
  Node,
  Identifier,
} from 'ts-morph';
import { ParamType, getParams as getRuntimeParams } from '@zistr/core'; // import runtime decorator info

export interface ParsedRouteController {
  className: string;
  classDecl: ClassDeclaration;
  methods: {
    name: string;
    methodDecl: MethodDeclaration;
    returnType: Type;
    params: {
      name: string;
      type: Type;
      decoratorType?: ParamType;
      dto?: any;
    }[];
    jsDoc?: string;
  }[];
}

/**
 * Resolve the real ClassDeclaration behind an identifier which might be imported.
 */
function resolveClassFromIdentifier(ident: Identifier, project: Project): ClassDeclaration {
  const symbol = ident.getSymbolOrThrow();
  const decls = symbol.getDeclarations();

  const findClassDecl = (nodes: Node[]): ClassDeclaration | undefined => {
    for (const n of nodes) {
      if (n.getKind() === SyntaxKind.ClassDeclaration) {
        return n.asKindOrThrow(SyntaxKind.ClassDeclaration);
      }
      const ancestor = n.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
      if (ancestor) return ancestor;
    }
    return undefined;
  };

  let classDecl = findClassDecl(decls);

  if (!classDecl) {
    const aliased = symbol.getAliasedSymbol?.();
    if (aliased) {
      classDecl = findClassDecl(aliased.getDeclarations());
    }
  }

  if (!classDecl) {
    throw new Error(
      `Could not resolve ClassDeclaration for identifier "${ident.getText()}".` +
        `\nDeclarations found: ${decls.map((d) => d.getKindName()).join(', ')}` +
        `\nFile: ${ident.getSourceFile().getFilePath()}`
    );
  }

  return classDecl;
}

/**
 * Extract controllers from:
 *
 *   export const routes = getRouteDefinitions([A, B, C])
 *
 * Works for controllers imported from other files.
 */
export function parseControllersFromRoutesModule(sourceFile: SourceFile, project: Project): ParsedRouteController[] {
  const exportVar = sourceFile.getVariableDeclarations().find((v) => v.getName() === 'routes');

  if (!exportVar) {
    throw new Error(`Cannot find exported "routes" variable in ${sourceFile.getFilePath()}`);
  }

  const initializer = exportVar.getInitializerOrThrow();
  const arrayArg = initializer.getFirstDescendantByKindOrThrow(
    SyntaxKind.ArrayLiteralExpression
  ) as ArrayLiteralExpression;
  const controllerItems = arrayArg.getElements();
  const results: ParsedRouteController[] = [];

  for (const node of controllerItems) {
    const ident = node.asKind(SyntaxKind.Identifier);
    if (!ident) {
      throw new Error(`Expected controller entry to be an Identifier, got ${node.getKindName()}`);
    }

    const classDecl = resolveClassFromIdentifier(ident, project);

    const methods = classDecl.getInstanceMethods().map((m) => {
      const returnType = m.getReturnType();
      const tsParams = m.getParameters();

      // retrieve runtime decorator metadata using reflect-metadata
      const runtimeParams = getRuntimeParams(classDecl.getNameOrThrow().prototype, m.getName()) || [];

      // merge ts-morph param info with runtime metadata
      const params = tsParams.map((p, index) => {
        const meta = runtimeParams[index];
        return {
          name: p.getName(),
          type: p.getType(),
          decoratorType: meta?.type, // ParamType enum
          dto: meta?.dto,
        };
      });

      const jsDoc = m
        .getJsDocs()
        .map((d) => d.getComment() ?? '')
        .join('\n')
        .trim();

      return {
        name: m.getName(),
        methodDecl: m,
        returnType,
        params,
        jsDoc: jsDoc || undefined,
      };
    });

    results.push({
      className: classDecl.getNameOrThrow(),
      classDecl,
      methods,
    });
  }

  return results;
}
