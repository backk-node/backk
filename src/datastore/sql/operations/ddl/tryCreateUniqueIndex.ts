import DataStore from '../../../DataStore';
import tryCreateIndex from './tryCreateIndex';

export default async function tryCreateUniqueIndex(
  dataStore: DataStore,
  indexName: string,
  schema: string | undefined,
  indexFields: string[]
) {
  await tryCreateIndex(dataStore, indexName, schema, indexFields, true);
}
