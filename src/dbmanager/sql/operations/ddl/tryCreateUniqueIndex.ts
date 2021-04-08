import AbstractDbManager from '../../../AbstractDbManager';
import tryCreateIndex from './tryCreateIndex';

export default async function tryCreateUniqueIndex(
  dbManager: AbstractDbManager,
  indexName: string,
  schema: string | undefined,
  indexFields: string[]
) {
  await tryCreateIndex(dbManager, indexName, schema, indexFields, true);
}
