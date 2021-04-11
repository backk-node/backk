import { readFileSync } from 'fs';
import parse from 'csv-parse/lib/sync';

export default function tryGetObjectsFromCsvFile(
  filePathName: string,
  columnNames: string[] | 'readFromFirstRow' = 'readFromFirstRow',
  delimiter = ','
): { [key: string]: any }[] {
  return parse(readFileSync(filePathName, { encoding: 'UTF-8' }), {
    columns: columnNames === 'readFromFirstRow' ? true : columnNames,
    // eslint-disable-next-line @typescript-eslint/camelcase
    skip_empty_lines: true,
    trim: true,
    delimiter
  });
}
