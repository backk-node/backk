import { readFileSync } from 'fs';

export default function getSeparatedIntegerValuesFromTextFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): number[] {
  const fullPathName = process.cwd() + "/build/resources/" + filePathNameRelativeToResourcesDir;
  return readFileSync(fullPathName, { encoding: 'UTF-8' })
    .split(separator)
    .filter((value) => value)
    .map((value) => value.trim())
    .map((value) => parseInt(value, 10));
}
