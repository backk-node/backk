import { readFileSync } from 'fs';

export default function getSeparatedValuesFromTextFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): string[] {
  return readFileSync(filePathNameRelativeToResourcesDir, { encoding: 'UTF-8' })
    .split(separator)
    .filter((value) => value)
    .map((value) => value.trim())
}
