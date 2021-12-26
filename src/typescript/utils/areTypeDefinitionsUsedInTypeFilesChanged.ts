import { parseSync } from '@babel/core';
import { Stats, existsSync, readFileSync, statSync } from 'fs';
import types from '../../types/types';
import getSrcFilePathNameForTypeName, {
  getFileNamesRecursively,
} from '../../utils/file/getSrcFilePathNameForTypeName';

function areSuperClassDefinitionsChanged(typeName: string, tsFileStats: Stats): boolean {
  if ((types as any)[typeName]) {
    return false;
  }

  const typeFilePathName = getSrcFilePathNameForTypeName(typeName);
  const fileContentsStr = readFileSync(typeFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(fileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript',
    ],
  });

  const nodes = (ast as any).program.body;

  for (const node of nodes) {
    if (
      (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
      node.declaration.type === 'ClassDeclaration' &&
      node.declaration.superClass
    ) {
      const superClassTypeName = node.declaration.superClass.name;
      if (!(types as any)[superClassTypeName]) {
        const superClassTypeFilePathName = getSrcFilePathNameForTypeName(superClassTypeName);
        if (existsSync(typeFilePathName)) {
          const superClassTypeFileStats = statSync(superClassTypeFilePathName);
          if (superClassTypeFileStats.mtimeMs > tsFileStats.mtimeMs) {
            return true;
          }
          return areSuperClassDefinitionsChanged(superClassTypeName, tsFileStats);
        }
      }
    }
  }

  return false;
}

function areTypeDefinitionsUsedInTypeFileChanged(typeFilePathName: string): boolean {
  const typeFileLines = readFileSync(typeFilePathName, { encoding: 'UTF-8' }).split('\n');
  const usedSpreadTypeNames: string[] = [];
  let superClassName;

  typeFileLines.forEach((typeFileLine) => {
    const trimmedTypeFileLine = typeFileLine.trim();
    if (trimmedTypeFileLine.match(/class [A-Z_][A-Za-z0-9_]* extends [A-Z_][A-Za-z0-9_]*/)) {
      superClassName = trimmedTypeFileLine.split(' extends ').pop()?.split(' ')[0];
    }
    if (trimmedTypeFileLine.startsWith('...')) {
      let spreadType = trimmedTypeFileLine.slice(3, trimmedTypeFileLine.endsWith(';') ? -1 : undefined);

      if (spreadType.startsWith('Private<')) {
        spreadType = spreadType.slice(8, -1);
      }

      if (spreadType.startsWith('ReadWrite<')) {
        spreadType = spreadType.slice(7, -1);
      }

      if (spreadType.startsWith('Readonly<')) {
        spreadType = spreadType.slice(9, -1);
      }

      if (spreadType.startsWith('Partial<')) {
        spreadType = spreadType.slice(8, -1);
      } else if (spreadType.startsWith('NonNullable<')) {
        spreadType = spreadType.slice(12, -1);
      }

      let baseType = spreadType;
      if (spreadType.startsWith('Omit<')) {
        baseType = spreadType.slice(5).split(',')[0].trim();
      } else if (spreadType.startsWith('Pick<')) {
        baseType = spreadType.slice(5).split(',')[0].trim();
      }
      usedSpreadTypeNames.push(baseType);
    }
  });

  for (const usedSpreadTypeName of usedSpreadTypeNames) {
    if ((types as any)[usedSpreadTypeName]) {
      continue;
    }

    const tsFilePathName = typeFilePathName.replace(/.type$/, '.ts');
    const usedSpreadTypeFilePathName = getSrcFilePathNameForTypeName(usedSpreadTypeName);

    if (existsSync(tsFilePathName) && existsSync(usedSpreadTypeFilePathName)) {
      const tsFileStats = statSync(tsFilePathName);
      const usedSpreadTypeFileStats = statSync(usedSpreadTypeFilePathName);
      if (usedSpreadTypeFileStats.mtimeMs > tsFileStats.mtimeMs) {
        return true;
      }
      if (superClassName && areSuperClassDefinitionsChanged(superClassName, tsFileStats)) {
        return true;
      }
      if (areSuperClassDefinitionsChanged(usedSpreadTypeName, tsFileStats)) {
        return true;
      }
    }
  }

  return false;
}

export default function areTypeDefinitionsUsedInTypeFilesChanged(): boolean {
  const filePathNames = getFileNamesRecursively(process.cwd() + '/src');
  const typeFilePathNames = filePathNames.filter((filePathName: string) => filePathName.endsWith('.type'));

  for (const typeFilePathName of typeFilePathNames) {
    if (areTypeDefinitionsUsedInTypeFileChanged(typeFilePathName)) {
      return true;
    }
  }

  return false;
}
