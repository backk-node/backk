import { parseSync } from '@babel/core';
import generate from '@babel/generator';
import { exec } from 'child_process';
import util from 'util';
import { readFileSync, writeFileSync } from 'fs';
import _ from 'lodash';
import { getFileNamesRecursively } from '../../utils/file/getSrcFilePathNameForTypeName';
import getTypeFilePathNameFor from '../../utils/file/getTypeFilePathNameFor';
import parseTypescriptLinesForTypeName from '../parser/parseTypescriptLinesForTypeName';
import mergeImports from '../utils/mergeImports';

const promisifiedExec = util.promisify(exec);

function generateTypescriptFileFor(
  typeFilePathName: string,
  handledTypeFilePathNames: string[],
  promisifiedExecs: Array<Promise<any>>
) {
  const typeFileLines = readFileSync(typeFilePathName, { encoding: 'UTF-8' }).split('\n');
  let outputImportCodeLines: string[] = [];
  let outputClassPropertyDeclarations: any[] = [];
  const codeLines: string[] = [];

  typeFileLines.forEach((typeFileLine) => {
    const trimmedTypeFileLine = typeFileLine.trim();
    if (trimmedTypeFileLine.startsWith('...')) {
      let spreadType = trimmedTypeFileLine.slice(3, trimmedTypeFileLine.endsWith(';') ? -1 : undefined);
      let isBaseTypeOptional = false;
      let isReadonly = false;
      let isPublic = false;
      let isNonNullable = false;
      let isPrivate = false;

      if (spreadType.startsWith('Private<')) {
        spreadType = spreadType.slice(8, -1);
        isPrivate = true;
      }

      if (spreadType.startsWith('Public<')) {
        spreadType = spreadType.slice(7, -1);
        isPublic = true;
      }

      if (spreadType.startsWith('Readonly<')) {
        spreadType = spreadType.slice(9, -1);
        isReadonly = true;
      }

      if (spreadType.startsWith('Partial<')) {
        spreadType = spreadType.slice(8, -1);
        isBaseTypeOptional = true;
      } else if (spreadType.startsWith('NonNullable<')) {
        spreadType = spreadType.slice(12, -1);
        isNonNullable = true;
      }

      if (spreadType.startsWith('Omit<')) {
        const baseType = spreadType
          .slice(5)
          .split(',')[0]
          .trim();

        const ommittedKeyParts = spreadType
          .slice(5)
          .split(',')[1]
          .slice(0, -1)
          .split('|');

        const omittedKeys = ommittedKeyParts.map((omittedKeyPart) => omittedKeyPart.trim().split(/["']/)[1]);
        const baseTypeFilePathName = getTypeFilePathNameFor(baseType);

        if (baseTypeFilePathName) {
          handledTypeFilePathNames.push(baseTypeFilePathName);
          generateTypescriptFileFor(baseTypeFilePathName, handledTypeFilePathNames, promisifiedExecs);
        }

        const [importLines, classPropertyDeclarations] = parseTypescriptLinesForTypeName(
          baseType,
          isBaseTypeOptional,
          isReadonly,
          isPublic,
          isNonNullable,
          isPrivate,
          omittedKeys,
          'omit',
          typeFilePathName
        );

        outputImportCodeLines = outputImportCodeLines.concat(importLines);
        outputClassPropertyDeclarations = outputClassPropertyDeclarations.concat(classPropertyDeclarations);
      } else if (spreadType.startsWith('Pick<')) {
        const baseType = spreadType
          .slice(5)
          .split(',')[0]
          .trim();

        const pickedKeyParts = spreadType
          .slice(5)
          .split(',')[1]
          .slice(0, -1)
          .split('|');

        const pickedKeys = pickedKeyParts.map((pickedKeyPart) => {
          if (pickedKeyPart.includes(' as ')) {
            return pickedKeyPart
              .trim()
              .split(' as ')[0]
              .split(/["']/)[1];
          }

          return pickedKeyPart.trim().split(/["']/)[1];
        });

        const keyToNewKeyMap: { [key: string]: string[] } = {};

        pickedKeyParts.forEach((pickedKeyPart) => {
          if (pickedKeyPart.includes(' as ')) {
            let [key, newKey] = pickedKeyPart.trim().split(' as ');
            key = key.split(/["']/)[1];
            newKey = newKey.split(/["']/)[1];
            if (keyToNewKeyMap[key]) {
              keyToNewKeyMap[key].push(newKey);
            } else {
              keyToNewKeyMap[key] = [newKey];
            }
          }
        });

        const baseTypeFilePathName = getTypeFilePathNameFor(baseType);

        if (baseTypeFilePathName) {
          handledTypeFilePathNames.push(baseTypeFilePathName);
          generateTypescriptFileFor(baseTypeFilePathName, handledTypeFilePathNames, promisifiedExecs);
        }

        const [importLines, classPropertyDeclarations] = parseTypescriptLinesForTypeName(
          baseType,
          isBaseTypeOptional,
          isReadonly,
          isPublic,
          isNonNullable,
          isPrivate,
          pickedKeys,
          'pick',
          typeFilePathName,
          keyToNewKeyMap
        );

        outputImportCodeLines = outputImportCodeLines.concat(importLines);
        outputClassPropertyDeclarations = outputClassPropertyDeclarations.concat(classPropertyDeclarations);
      } else {
        const spreadTypeFilePathName = getTypeFilePathNameFor(spreadType);
        const baseType = spreadType;

        if (spreadTypeFilePathName) {
          handledTypeFilePathNames.push(spreadTypeFilePathName);
          generateTypescriptFileFor(spreadTypeFilePathName, handledTypeFilePathNames, promisifiedExecs);
        }

        const [importLines, classPropertyDeclarations] = parseTypescriptLinesForTypeName(
          baseType,
          isBaseTypeOptional,
          isReadonly,
          isPublic,
          isNonNullable,
          isPrivate,
          [],
          'omit',
          typeFilePathName
        );

        outputImportCodeLines = outputImportCodeLines.concat(importLines);
        outputClassPropertyDeclarations = outputClassPropertyDeclarations.concat(classPropertyDeclarations);
      }
    } else {
      codeLines.push(typeFileLine);
    }
  });

  const ast = parseSync(codeLines.join('\n'), {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const classDecoratorNames: string[] = [];
  const classDecoratorArguments: string[] = [];
  const nodes = (ast as any).program.body;

  for (const node of nodes) {
    if (
      (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
      node.declaration.type === 'ClassDeclaration'
    ) {
      (node.declaration.decorators ?? []).forEach((decorator: any) => {
        classDecoratorNames.push(decorator.expression.callee.name);

        const argumentsStr = (decorator.expression.arguments ?? [])
          .map((argument: any) => argument.extra.raw)
          .join(', ');

        classDecoratorArguments.push(argumentsStr);
      });

      node.declaration.decorators = undefined;

      const declarations = outputClassPropertyDeclarations.concat(node.declaration.body.body);
      declarations.reverse();
      const uniqueDeclarations = _.uniqBy(declarations, (declaration) => declaration.key.name);
      uniqueDeclarations.reverse();
      node.declaration.body.body = uniqueDeclarations;
    }
  }

  const classDecoratorLines = classDecoratorNames
    .map((classDecoratorName, index) => '@' + classDecoratorName + '(' + classDecoratorArguments[index] + ')')
    .join('\n');

  const outputCode = generate(ast as any).code;
  outputImportCodeLines = _.uniq(outputImportCodeLines);
  outputImportCodeLines = mergeImports(outputImportCodeLines);

  const outputFileHeaderLines = [
    '// This is an auto-generated file from the respective .type file',
    '// DO NOT MODIFY THIS FILE! Updates should be made to the respective .type file only',
    "// This file can be generated from the respective .type file by running npm script 'generateTypes'",
    '',
    ...outputImportCodeLines,
    ''
  ];

  let outputFileContentsStr = outputFileHeaderLines.join('\n') + '\n' + outputCode;

  outputFileContentsStr = outputFileContentsStr
    .split('\n')
    .map((outputFileLine) => {
      if (outputFileLine.endsWith(';') && !outputFileLine.startsWith('import')) {
        return outputFileLine + '\n';
      }

      if (outputFileLine.startsWith('export default class') || outputFileLine.startsWith('export class')) {
        return classDecoratorLines + '\n' + outputFileLine;
      }

      return outputFileLine;
    })
    .join('\n');

  const outputFileName = typeFilePathName.split('.')[0] + '.ts';
  writeFileSync(outputFileName, outputFileContentsStr, { encoding: 'UTF-8' });

  const organizeImportsPromise = promisifiedExec(
    process.cwd() + '/node_modules/.bin/organize-imports-cli ' + outputFileName
  );

  promisifiedExecs.push(organizeImportsPromise);

  organizeImportsPromise.then(() => {
    promisifiedExecs.push(
      promisifiedExec(process.cwd() + '/node_modules/.bin/prettier --write ' + outputFileName)
    );
  });
}

(async function generateTypescriptFilesFromTypeDefinitionFiles() {
  const filePathNames = getFileNamesRecursively(process.cwd() + '/src');
  const handledTypeFilePathNames: string[] = [];
  const promisifiedExecs: Array<Promise<any>> = [];

  filePathNames
    .filter((filePathName: string) => filePathName.endsWith('.type'))
    .forEach((typeFilePathName) => {
      if (handledTypeFilePathNames.includes(typeFilePathName)) {
        return;
      }

      generateTypescriptFileFor(typeFilePathName, handledTypeFilePathNames, promisifiedExecs);
    });

  await Promise.all(promisifiedExecs);
})().catch((error) => {
  console.log(error);
  process.exit(1);
});
