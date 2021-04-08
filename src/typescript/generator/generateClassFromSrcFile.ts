import { readFileSync } from 'fs';
import * as ts from 'typescript';
import path from 'path';
import getSrcFilePathNameForTypeName from '../../utils/file/getSrcFilePathNameForTypeName';
import types from '../../types/types';

export default function generateClassFromSrcFile(typeName: string, remoteServiceRootDir = '') {
  if ((types as any)[typeName]) {
    // TODO check that typeName cannot be found in src folder, because it is overlapping with built-in backk type
    return (types as any)[typeName];
  }

  const srcFilePathName = getSrcFilePathNameForTypeName(typeName, remoteServiceRootDir);
  const fileContentsStr = readFileSync(srcFilePathName, { encoding: 'UTF-8' });
  const srcDirectory = path.dirname(srcFilePathName).split(/src/)[1];
  const result = ts.transpileModule(fileContentsStr, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      esModuleInterop: true,
      incremental: true
    }
  });

  const outputRows = result.outputText.split('\n');
  let newOutputText = outputRows.slice(0, -2).join('\n') + '\n' + '(' + typeName + ')';

  newOutputText = newOutputText.replace(
    /require\("\.{2}\//g,
    'require("../../../..' +
      (remoteServiceRootDir ? '/' + remoteServiceRootDir : '') +
      '/dist' +
      srcDirectory +
      '/../'
  );

  newOutputText = newOutputText.replace(
    /require\("\.\//g,
    'require("../../../..' +
      (remoteServiceRootDir ? '/' + remoteServiceRootDir : '') +
      '/dist' +
      srcDirectory +
      '/'
  );

  const generatedClass = eval(newOutputText);
  return generatedClass;
}
