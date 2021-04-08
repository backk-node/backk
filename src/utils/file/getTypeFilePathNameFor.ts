import { getFileNamesRecursively } from './getSrcFilePathNameForTypeName';

export default function getTypeFilePathNameFor(typeName: string): string | undefined {
  const filePathNames = getFileNamesRecursively(process.cwd() + '/src');
  return filePathNames.find((filePathName: string) => filePathName.endsWith('/' + typeName + '.type'));
}
