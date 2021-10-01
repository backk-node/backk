import _ from 'lodash';
import { parseSync } from '@babel/core';
import generate from '@babel/generator';
import { readFileSync } from 'fs';
import path from 'path';
import getSrcFilePathNameForTypeName, {
  hasSrcFilenameForTypeName
} from '../../utils/file/getSrcFilePathNameForTypeName';

function getDeclarationsFor(typeName: string, originatingTypeFilePathName: string) {
  let isBuiltInType = false;
  const typeFilePathName = getSrcFilePathNameForTypeName(typeName);
  if (typeFilePathName.includes('node_modules/backk')) {
    isBuiltInType = true;
  }
  const fileContentsStr = readFileSync(typeFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(fileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;
  let importLines: string[] = [];
  let classPropertyDeclarations: any[] = [];

  for (const node of nodes) {
    if (node.type === 'ImportDeclaration') {
      if (isBuiltInType && node.source.value === 'class-validator') {
        node.source.value = 'backk';
      }
      if (node.source.value.startsWith('.')) {
        if (isBuiltInType) {
          node.source.value = 'backk';
          if (node.specifiers[0]?.type === 'ImportDefaultSpecifier') {
            node.specifiers[0].type = 'ImportSpecifier';
            node.specifiers[0].imported = node.specifiers[0].local;
          }
        } else {
          const relativeImportPathName = node.source.value;

          const importAbsolutePathName = path.resolve(
            path.dirname(typeFilePathName ?? ''),
            relativeImportPathName
          );

          let newRelativeImportPathName = path.relative(
            path.dirname(originatingTypeFilePathName),
            importAbsolutePathName
          );

          if (!newRelativeImportPathName.startsWith('.')) {
            newRelativeImportPathName = './' + newRelativeImportPathName;
          }

          if (newRelativeImportPathName !== relativeImportPathName) {
            node.source.value = newRelativeImportPathName;
          }
        }
      }

      importLines.push(generate(node).code);
    }
    if (
      (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
      node.declaration.type === 'ClassDeclaration'
    ) {
      if (node.declaration.superClass) {
        const [superClassesImportLines, superClassesPropertyDeclarations] = getDeclarationsFor(
          node.declaration.superClass.name,
          originatingTypeFilePathName
        );

        importLines = importLines.concat(superClassesImportLines);
        classPropertyDeclarations = classPropertyDeclarations.concat(superClassesPropertyDeclarations);
      }

      node.declaration.body.body.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassProperty') {
          classPropertyDeclarations.push(classBodyNode);
        }
      });
    }
  }

  return [importLines, classPropertyDeclarations];
}

export default function parseTypescriptLinesForTypeName(
  typeName: string,
  isBaseTypeOptional: boolean,
  isReadonly: boolean,
  isReadWrite: boolean,
  isNonNullable: boolean,
  isPrivate: boolean,
  keys: string[],
  keyType: 'omit' | 'pick',
  originatingTypeFilePathName: string,
  keyToNewKeyMap?: { [key: string]: string[] }
): [string[], any[]] {
  let typeFilePathName;
  let fileContentsStr;
  let isBuiltInType = false;

  if (hasSrcFilenameForTypeName(typeName)) {
    typeFilePathName = getSrcFilePathNameForTypeName(typeName);
    if (typeFilePathName.includes('node_modules/backk')) {
      isBuiltInType = true;
    }
    fileContentsStr = readFileSync(typeFilePathName, { encoding: 'UTF-8' });
  } else {
    throw new Error('In type file: ' + originatingTypeFilePathName + ': Unsupported type: ' + typeName);
  }

  const ast = parseSync(fileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;
  let importLines: string[] = [];
  const finalClassPropertyDeclarations: any[] = [];
  const classPropertyNames: string[] = [];

  for (const node of nodes) {
    if (node.type === 'ImportDeclaration') {
      if (isBuiltInType && node.source.value === 'class-validator') {
        node.source.value = 'backk';
      }
      if (node.source.value.startsWith('.')) {
        if (isBuiltInType) {
          node.source.value = 'backk';
          if (node.specifiers[0]?.type === 'ImportDefaultSpecifier') {
            node.specifiers[0].type = 'ImportSpecifier';
            node.specifiers[0].imported = node.specifiers[0].local;
          }
        } else {
          const relativeImportPathName = node.source.value;

          const importAbsolutePathName = path.resolve(
            path.dirname(typeFilePathName ?? ''),
            relativeImportPathName
          );

          const newRelativeImportPathName = path.relative(
            path.dirname(originatingTypeFilePathName),
            importAbsolutePathName
          );

          if (newRelativeImportPathName !== relativeImportPathName) {
            node.source.value = newRelativeImportPathName;
          }
        }
      }

      importLines.push(generate(node).code);
    }
    if (
      (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
      node.declaration.type === 'ClassDeclaration'
    ) {
      let classPropertyDeclarations: any[] = [];

      if (node.declaration.superClass) {
        const [superClassesImportLines, superClassesPropertyDeclarations] = getDeclarationsFor(
          node.declaration.superClass.name,
          originatingTypeFilePathName
        );

        importLines = importLines.concat(superClassesImportLines);
        classPropertyDeclarations = classPropertyDeclarations.concat(superClassesPropertyDeclarations);
      }

      classPropertyDeclarations = classPropertyDeclarations.concat(node.declaration.body.body);

      classPropertyDeclarations.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassProperty') {
          const propertyName = classBodyNode.key.name;
          classPropertyNames.push(propertyName);

          if (keyType === 'omit' && keys.includes(propertyName)) {
            return;
          } else if (keyType === 'pick') {
            if (!keys.includes(propertyName)) {
              return;
            }

            if (keyToNewKeyMap && keyToNewKeyMap[propertyName]) {
              keyToNewKeyMap[propertyName].forEach((newKey) => {
                const classProperty = _.cloneDeep(classBodyNode);
                classProperty.key.name = newKey;

                if (isBaseTypeOptional) {
                  classProperty.optional = true;
                  classProperty.definite = false;
                }

                if (isReadonly) {
                  classProperty.accessibility = undefined;
                  classProperty.decorators = classProperty.decorators?.filter(
                    (decorator: any) =>
                      decorator.expression.callee.name !== 'Private' &&
                      decorator.expression.callee.name !== 'IsUndefined' &&
                      decorator.expression.callee.name !== 'ReadOnly' &&
                      decorator.expression.callee.name !== 'WriteOnly' &&
                      decorator.expression.callee.name !== 'CreateOnly' &&
                      decorator.expression.callee.name !== 'UpdateOnly' &&
                      decorator.expression.callee.name !== 'ReadUpdate' &&
                      decorator.expression.callee.name !== 'ReadWrite'
                  );

                  importLines.push("import { ReadOnly } from 'backk';");

                  classProperty.decorators.push({
                    type: 'Decorator',
                    expression: {
                      type: 'CallExpression',
                      callee: {
                        type: 'Identifier',
                        name: 'ReadOnly'
                      },
                      arguments: [],
                      optional: false
                    }
                  });
                }

                if (isReadWrite) {
                  classProperty.decorators = classProperty.decorators?.filter(
                    (decorator: any) =>
                      decorator.expression.callee.name !== 'Private' &&
                      decorator.expression.callee.name !== 'IsUndefined' &&
                      decorator.expression.callee.name !== 'ReadOnly' &&
                      decorator.expression.callee.name !== 'WriteOnly' &&
                      decorator.expression.callee.name !== 'CreateOnly' &&
                      decorator.expression.callee.name !== 'UpdateOnly' &&
                      decorator.expression.callee.name !== 'ReadUpdate' &&
                      decorator.expression.callee.name !== 'ReadWrite'
                  );

                  importLines.push("import { ReadWrite } from 'backk';");

                  classProperty.decorators.push({
                    type: 'Decorator',
                    expression: {
                      type: 'CallExpression',
                      callee: {
                        type: 'Identifier',
                        name: 'ReadWrite'
                      },
                      arguments: [],
                      optional: false
                    }
                  });
                }

                if (isPrivate) {
                  classProperty.accessibility = undefined;

                  classProperty.decorators = classProperty.decorators?.filter(
                    (decorator: any) =>
                      decorator.expression.callee.name !== 'Private' &&
                      decorator.expression.callee.name !== 'IsUndefined' &&
                      decorator.expression.callee.name !== 'ReadOnly' &&
                      decorator.expression.callee.name !== 'WriteOnly' &&
                      decorator.expression.callee.name !== 'CreateOnly' &&
                      decorator.expression.callee.name !== 'UpdateOnly' &&
                      decorator.expression.callee.name !== 'ReadUpdate' &&
                      decorator.expression.callee.name !== 'ReadWrite'
                  );

                  importLines.push("import { Private } from 'backk';");

                  classProperty.decorators.push({
                    type: 'Decorator',
                    expression: {
                      type: 'CallExpression',
                      callee: {
                        type: 'Identifier',
                        name: 'Private'
                      },
                      arguments: [],
                      optional: false
                    }
                  });
                }

                if (isNonNullable) {
                  classProperty.optional = false;
                  if (
                    classProperty.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
                    classProperty.typeAnnotation.typeAnnotation?.types[1]?.type === 'TSNullKeyword'
                  ) {
                    classProperty.typeAnnotation.typeAnnotation =
                      classProperty.typeAnnotation.typeAnnotation.types[0];
                  }
                }

                finalClassPropertyDeclarations.push(classProperty);
              });
              return;
            }
          }
        }

        if (isBaseTypeOptional) {
          classBodyNode.optional = true;
          classBodyNode.definite = false;
        }

        if (isReadonly) {
          classBodyNode.decorators = classBodyNode.decorators?.filter(
            (decorator: any) =>
              decorator.expression.callee.name !== 'Private' &&
              decorator.expression.callee.name !== 'IsUndefined' &&
              decorator.expression.callee.name !== 'ReadOnly' &&
              decorator.expression.callee.name !== 'WriteOnly' &&
              decorator.expression.callee.name !== 'CreateOnly' &&
              decorator.expression.callee.name !== 'UpdateOnly' &&
              decorator.expression.callee.name !== 'ReadUpdate' &&
              decorator.expression.callee.name !== 'ReadWrite'
          );

          importLines.push("import { ReadOnly } from 'backk';");

          classBodyNode.decorators.push({
            type: 'Decorator',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'ReadOnly'
              },
              arguments: [],
              optional: false
            }
          });
        }

        if (isReadWrite) {
          classBodyNode.decorators = classBodyNode.decorators?.filter(
            (decorator: any) =>
              decorator.expression.callee.name !== 'Private' &&
              decorator.expression.callee.name !== 'IsUndefined' &&
              decorator.expression.callee.name !== 'ReadOnly' &&
              decorator.expression.callee.name !== 'WriteOnly' &&
              decorator.expression.callee.name !== 'CreateOnly' &&
              decorator.expression.callee.name !== 'UpdateOnly' &&
              decorator.expression.callee.name !== 'ReadUpdate' &&
              decorator.expression.callee.name !== 'ReadWrite'
          );

          importLines.push("import { ReadWrite } from 'backk';");

          classBodyNode.decorators.push({
            type: 'Decorator',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'ReadWrite'
              },
              arguments: [],
              optional: false
            }
          });
        }

        if (isPrivate) {
          classBodyNode.accessibility = undefined;

          classBodyNode.decorators = classBodyNode.decorators?.filter(
            (decorator: any) =>
              decorator.expression.callee.name !== 'Private' &&
              decorator.expression.callee.name !== 'IsUndefined' &&
              decorator.expression.callee.name !== 'ReadOnly' &&
              decorator.expression.callee.name !== 'WriteOnly' &&
              decorator.expression.callee.name !== 'CreateOnly' &&
              decorator.expression.callee.name !== 'UpdateOnly' &&
              decorator.expression.callee.name !== 'ReadUpdate' &&
              decorator.expression.callee.name !== 'ReadWrite'
          );

          importLines.push("import { Private } from 'backk';");

          classBodyNode.decorators.push({
            type: 'Decorator',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'Private'
              },
              arguments: [],
              optional: false
            }
          });
        }

        if (isNonNullable) {
          classBodyNode.optional = false;
          if (
            classBodyNode.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
            classBodyNode.typeAnnotation.typeAnnotation?.types[1]?.type === 'TSNullKeyword'
          ) {
            classBodyNode.typeAnnotation.typeAnnotation =
              classBodyNode.typeAnnotation.typeAnnotation.types[0];
          }
        }

        finalClassPropertyDeclarations.push(classBodyNode);
      });
    }
  }

  keys.forEach((key) => {
    if (!classPropertyNames.some((classPropertyName) => classPropertyName === key)) {
      throw new Error(
        'In type file: ' +
          originatingTypeFilePathName +
          ': key: ' +
          key +
          ' does not exists in type: ' +
          typeName
      );
    }
  });

  return [importLines, finalClassPropertyDeclarations];
}
