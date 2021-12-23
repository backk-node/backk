import { readFileSync } from 'fs';
import { JSONPath } from 'jsonpath-plus';

export default function getValuesByJsonPathFromJsonFileOrThrow(filePathNameRelativeToResourcesDir: string, jsonPath: string): any[] {
  const object = JSON.parse(readFileSync(filePathNameRelativeToResourcesDir, { encoding: 'UTF-8' }));
  return JSONPath({ json: object, path: jsonPath });
}
