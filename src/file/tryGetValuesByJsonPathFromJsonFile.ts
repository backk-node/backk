import { readFileSync } from 'fs';
import { JSONPath } from 'jsonpath-plus';

export default function tryGetValuesByJsonPathFromJsonFile(filePathName: string, jsonPath: string): any[] {
  const object = JSON.parse(readFileSync(filePathName, { encoding: 'UTF-8' }));
  return JSONPath({ json: object, path: jsonPath });
}
