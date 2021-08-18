import AbstractDataStore from '../../../AbstractDataStore';
import tryCreateIndex from './tryCreateIndex';

export default async function tryCreateUniqueIndex(
  dataStore: AbstractDataStore,
  indexName: string,
  schema: string | undefined,
  indexFields: string[]
) {
  await tryCreateIndex(dataStore, indexName, schema, indexFields, true);
}
