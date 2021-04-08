import { Dirent, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export function getFileNamesRecursively(directory: string): string[] {
  const directoryEntries = readdirSync(directory, { withFileTypes: true });

  const files = directoryEntries.map((directoryEntry: Dirent) => {
    const pathName = resolve(directory, directoryEntry.name);
    return directoryEntry.isDirectory() ? getFileNamesRecursively(pathName) : pathName;
  });

  return Array.prototype.concat(...files);
}

export function hasSrcFilenameForTypeName(typeName: string, serviceRootDir: string = '') {
  if (typeName.includes(':')) {
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.split(':')[1];
  }

  const srcFilePathNames = getFileNamesRecursively(process.cwd() + (serviceRootDir ? '/' + serviceRootDir : '') + '/src');
  let backkSrcFilePathNames: string[] = [];
  if (existsSync(process.cwd() + '/node_modules/backk/src')) {
    backkSrcFilePathNames = getFileNamesRecursively(process.cwd() + '/node_modules/backk/src');
  }

  const foundFilePathName = [...srcFilePathNames, ...backkSrcFilePathNames].find((filePathName: string) => {
    return filePathName.endsWith('/' + typeName + '.ts');
  });

  return !!foundFilePathName;
}

export function hasBackkSrcFilenameForTypeName(typeName: string) {
  if (typeName.includes(':')) {
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.split(':')[1];
  }

  const srcFilePathNames = getFileNamesRecursively(process.cwd() + '/src');
  let backkSrcFilePathNames: string[] = [];
  if (existsSync(process.cwd() + '/node_modules/backk/src')) {
    backkSrcFilePathNames = getFileNamesRecursively(process.cwd() + '/node_modules/backk/src');
  }

  const foundFilePathName = [...srcFilePathNames, ...backkSrcFilePathNames].find((filePathName: string) => {
    return filePathName.includes('backk') && filePathName.endsWith('/' + typeName + '.ts');
  });

  return !!foundFilePathName;
}

export default function getSrcFilePathNameForTypeName(typeName: string, serviceRootDir: string = ''): string {
  if (typeName.includes(':')) {
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.split(':')[1];
  }

  const srcFilePathNames = getFileNamesRecursively(
    process.cwd() + (serviceRootDir ? '/' + serviceRootDir : '') + '/src'
  );

  let backkSrcFilePathNames: string[] = [];
  if (existsSync(process.cwd() + '/node_modules/backk/src')) {
    backkSrcFilePathNames = getFileNamesRecursively(process.cwd() + '/node_modules/backk/src');
  }

  const foundFilePathNames = [...srcFilePathNames, ...backkSrcFilePathNames].filter(
    (filePathName: string) => {
      return filePathName.endsWith('/' + typeName + '.ts');
    }
  );

  if (foundFilePathNames.length === 0) {
    throw new Error('File not found for type: ' + typeName);
  } else if (foundFilePathNames.length > 1) {
    throw new Error('Multiple types with same name not supported: ' + typeName);
  }

  return foundFilePathNames[0];
}
