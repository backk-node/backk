import { readFileSync } from 'fs';

export default function getSeparatedValuesFromTextFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): string[] {
  const fullPathName = process.cwd() + "/build/resources/" + filePathNameRelativeToResourcesDir;
  return readFileSync(fullPathName, { encoding: 'UTF-8' })
    .split(separator)
    .filter((value) => value)
    .map((value) => value.trim())
}
