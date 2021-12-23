import { readFileSync } from 'fs';

export default function getSeparatedIntegerValuesFromTextFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): number[] {
  return readFileSync(filePathNameRelativeToResourcesDir, { encoding: 'UTF-8' })
    .split(separator)
    .filter((value) => value)
    .map((value) => value.trim())
    .map((value) => parseInt(value, 10));
}
