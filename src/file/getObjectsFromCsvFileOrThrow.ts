import { readFileSync } from 'fs';
import parse from 'csv-parse/lib/sync';

export default function getObjectsFromCsvFileOrThrow(
  filePathNameRelativeToResourcesDir: string,
  columnNames: string[] | 'readFromFirstRow' = 'readFromFirstRow',
  delimiter = ','
): { [key: string]: string }[] {
  return parse(readFileSync(filePathNameRelativeToResourcesDir, { encoding: 'UTF-8' }), {
    columns: columnNames === 'readFromFirstRow' ? true : columnNames,
    // eslint-disable-next-line @typescript-eslint/camelcase
    skip_empty_lines: true,
    trim: true,
    delimiter
  });
}
