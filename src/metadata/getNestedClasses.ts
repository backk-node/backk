import { parseSync } from '@babel/core';
import { readFileSync } from 'fs';
import getSrcFilePathNameForTypeName from '../utils/file/getSrcFilePathNameForTypeName';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import generateClassFromSrcFile from '../typescript/generator/generateClassFromSrcFile';
import isEnumTypeName from '../utils/type/isEnumTypeName';

export default function getNestedClasses(
  classNames: string[],
  Types: { [key: string]: new () => any },
  PublicTypes: { [key: string]: new () => any },
  remoteServiceRootDir = ''
) {
  classNames.forEach((className) => {
    if (className.includes(':')) {
      // noinspection AssignmentToFunctionParameterJS
      className = className.split(':')[1];
    }

    const fileContentsStr = readFileSync(getSrcFilePathNameForTypeName(className, remoteServiceRootDir), {
      encoding: 'UTF-8'
    });

    const fileRows = fileContentsStr.split('\n');

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
        (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
        node.declaration.type === 'ClassDeclaration' &&
        node.declaration.id.name === className
      ) {
        for (const classBodyNode of node.declaration.body.body) {
          if (classBodyNode.type === 'ClassProperty') {
            if (!classBodyNode.typeAnnotation) {
            throw new Error(className + '.' + classBodyNode.key.name + ' is missing type annotation')
            }

            const propertyTypeNameStart = classBodyNode.typeAnnotation.loc.start;
            const propertyTypeNameEnd = classBodyNode.typeAnnotation.loc.end;
            const propertyTypeName = fileRows[propertyTypeNameStart.line - 1].slice(
              propertyTypeNameStart.column + 2,
              propertyTypeNameEnd.column
            );

            const { baseTypeName } = getTypeInfoForTypeName(propertyTypeName);

            // noinspection IfStatementWithTooManyBranchesJS
            if (
              baseTypeName !== 'Date' &&
              baseTypeName.charAt(0).match(/^[_$A-Z]$/) &&
              !isEnumTypeName(baseTypeName)
            ) {
              if (!Types[baseTypeName]) {
                Types[baseTypeName] = generateClassFromSrcFile(baseTypeName, remoteServiceRootDir);
                PublicTypes[baseTypeName] = Types[baseTypeName];
                getNestedClasses([baseTypeName], Types, PublicTypes);

                let proto = Object.getPrototypeOf(new (Types[baseTypeName] as new () => any)());
                while (proto !== Object.prototype) {
                  if (!Types[proto.constructor.name]) {
                    Types[proto.constructor.name] = proto.constructor;
                    getNestedClasses([baseTypeName], Types, PublicTypes);
                  }
                  proto = Object.getPrototypeOf(proto);
                }
              }
            }
          }
        }
      }
    }
  });
}
