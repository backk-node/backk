import { readFileSync } from 'fs';
import parse from 'csv-parse/lib/sync';

export default function getObjectsFromCsvFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  columnNames: string[] | 'readFromFirstRow' = 'readFromFirstRow',
  delimiter = ','
): { [key: string]: string }[] {
  const fullPathName = process.cwd() + "/build/resources/" + filePathNameRelativeToResourcesDir;
  return parse(readFileSync(fullPathName, { encoding: 'UTF-8' }), {
    columns: columnNames === 'readFromFirstRow' ? true : columnNames,
    // eslint-disable-next-line @typescript-eslint/camelcase
    skip_empty_lines: true,
    trim: true,
    delimiter
  });
}
