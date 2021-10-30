import MongoDbDataStore from '../MongoDbDataStore';
import entityAnnotationContainer from '../../decorators/entity/entityAnnotationContainer';

export default async function tryCreateMongoDbIndex(
  dataStore: MongoDbDataStore,
  indexName: string,
  schema: string | undefined,
  indexFields: string[],
  isUnique = false
) {
  const collectionName = indexName.split(':')[0].toLowerCase();
  const sortOrder = entityAnnotationContainer.indexNameToSortOrderMap[indexName];

  const sortOrders = indexFields.map((indexField) => {
    if (indexField.toUpperCase().includes(' ASC')) {
      return 1;
    } else if (indexField.toUpperCase().includes(' DESC')) {
      return -1;
    }
    return 1;
  });

  await dataStore.tryReserveDbConnectionFromPool();

  await dataStore.tryExecute(false, async (client) => {
    await client
      .db(dataStore.getDbName())
      .createIndex(collectionName,
        indexFields.reduce(
          (indexFieldsSpec, indexField, index) => ({
            ...indexFieldsSpec,
            [indexField]: indexFields.length === 1 ? (sortOrder === 'ASC' ? 1 : -1) : sortOrders[index]
          }),
          {}
        ),
        {
          unique: isUnique
        }
      );
  });
}
