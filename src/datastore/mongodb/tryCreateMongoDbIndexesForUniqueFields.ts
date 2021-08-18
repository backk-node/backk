import MongoDbDataStore from '../MongoDbDataStore';
import forEachAsyncSequential from '../../utils/forEachAsyncSequential';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';

export default async function tryCreateMongoDbIndexesForUniqueFields(
  dataStore: MongoDbDataStore,
  EntityClass: Function
) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  await forEachAsyncSequential(Object.keys(entityMetadata), async (fieldName) => {
    if (typePropertyAnnotationContainer.isTypePropertyUnique(EntityClass, fieldName)) {
      await dataStore.tryReserveDbConnectionFromPool();

      await dataStore.tryExecute(false, async (client) => {
        await client.db(dataStore.dbName).createIndex(
          EntityClass.name.toLowerCase(),
          { [fieldName]: 1 },
          {
            unique: true
          }
        );
      });
    }
  });
}
