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

  // Helper: try to locate a ClassDeclaration from declarations
  const findClassDecl = (nodes: Node[]): ClassDeclaration | undefined => {
    for (const n of nodes) {
      if (n.getKind() === SyntaxKind.ClassDeclaration) {
        return n.asKindOrThrow(SyntaxKind.ClassDeclaration);
      }

      // Sometimes inside ExportSpecifier → ClassDecl is ancestor
      const ancestor = n.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
      if (ancestor) return ancestor;
    }
    return undefined;
  };

  // 1) Try direct declarations
  let classDecl = findClassDecl(decls);

  // 2) If imported → resolve alias
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
    // Expecting identifier for controller
    const ident = node.asKind(SyntaxKind.Identifier);
    if (!ident) {
      throw new Error(`Expected controller entry to be an Identifier, got ${node.getKindName()}`);
    }

    const classDecl = resolveClassFromIdentifier(ident, project);

    const methods = classDecl.getInstanceMethods().map((m) => {
      const returnType = m.getReturnType();
      const params = m.getParameters().map((p) => ({
        name: p.getName(),
        type: p.getType(),
      }));

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
