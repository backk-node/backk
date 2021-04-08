import { readFileSync } from 'fs';
import { parseSync } from '@babel/core';
import getSrcFilePathNameForTypeName from '../../utils/file/getSrcFilePathNameForTypeName';

export default function parseEnumValuesFromSrcFile(typeName: string) {
  const fileContentsStr = readFileSync(getSrcFilePathNameForTypeName(typeName), { encoding: 'UTF-8' });

  const ast = parseSync(fileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;

  for (const node of nodes) {
    if (
      node.type === 'ExportNamedDeclaration' &&
      node.declaration.type === 'TSTypeAliasDeclaration' &&
      node.declaration.id.name === typeName
    ) {
      return node.declaration.typeAnnotation.types.map((type: any) => type.literal.value);
    }
  }

  return [];
}
