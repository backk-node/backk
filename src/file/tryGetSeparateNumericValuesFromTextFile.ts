import { readFileSync } from 'fs';

export default function tryGetSeparatedIntegerValuesFromTextFile(
  filePathName: string,
  separator = '\n'
): number[] {
  return readFileSync(filePathName, { encoding: 'UTF-8' })
    .split(separator)
    .filter((value) => value)
    .map((value) => value.trim())
    .map((value) => parseInt(value, 10));
}
