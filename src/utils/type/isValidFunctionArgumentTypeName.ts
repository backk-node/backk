import { parseSync } from '@babel/core';
import { readFileSync } from 'fs';
import getSrcFilePathNameForTypeName from '../file/getSrcFilePathNameForTypeName';

export default function isValidFunctionArgumentTypeName(typeName: string, remoteServiceRootDir = ''): boolean {
  const typeFilePathName = getSrcFilePathNameForTypeName(typeName, remoteServiceRootDir);
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
      node.type === 'ExportDefaultDeclaration' &&
      node.declaration.type === 'ClassDeclaration' &&
      node.declaration.id.name === typeName
    ) {
      return true;
    }
  }

  return false;
}
