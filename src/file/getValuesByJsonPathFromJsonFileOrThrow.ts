import { readFileSync } from 'fs';
import { JSONPath } from 'jsonpath-plus';

export default function getValuesByJsonPathFromJsonFileOrThrow(filePathNameRelativeToResourcesDir: string, jsonPath: string): any[] {
  const fullPathName = process.cwd() + "/build/resources/" + filePathNameRelativeToResourcesDir;
  const object = JSON.parse(readFileSync(fullPathName, { encoding: 'UTF-8' }));
  return JSONPath({ json: object, path: jsonPath });
}
