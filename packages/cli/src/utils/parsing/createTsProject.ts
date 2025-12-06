import { Project } from 'ts-morph';
import path from 'node:path';
import fs from 'node:fs';

export function createTsProject(): Project {
  const tsconfigPath = ['tsconfig.json', './tsconfig.json', path.resolve(process.cwd(), 'tsconfig.json')].find((p) =>
    fs.existsSync(p)
  );

  return new Project(
    tsconfigPath
      ? { tsConfigFilePath: tsconfigPath }
      : {
          compilerOptions: {
            target: 99,
            module: 99,
            strict: true,
          },
        }
  );
}
