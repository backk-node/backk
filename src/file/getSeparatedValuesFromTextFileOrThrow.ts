import { readFileSync } from 'fs';
import log, { Severity } from "../observability/logging/log";

export default function getSeparatedValuesFromTextFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): string[] {
  try {
    const fullPathName = process.cwd() + "/build/resources/" + filePathNameRelativeToResourcesDir;
    return readFileSync(fullPathName, { encoding: 'UTF-8' })
      .split(separator)
      .filter((value) => value)
      .map((value) => value.trim())
  } catch(error) {
    log(Severity.ERROR, error.message, '');
    return []
  }
}
