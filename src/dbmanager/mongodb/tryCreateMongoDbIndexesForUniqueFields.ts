import MongoDbManager from '../MongoDbManager';
import forEachAsyncSequential from '../../utils/forEachAsyncSequential';
import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import typePropertyAnnotationContainer from '../../decorators/typeproperty/typePropertyAnnotationContainer';

export default async function tryCreateMongoDbIndexesForUniqueFields(
  dbManager: MongoDbManager,
  EntityClass: Function
) {
  const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass as any);

  await forEachAsyncSequential(Object.keys(entityMetadata), async (fieldName) => {
    if (typePropertyAnnotationContainer.isTypePropertyUnique(EntityClass, fieldName)) {
      await dbManager.tryReserveDbConnectionFromPool();

      await dbManager.tryExecute(false, async (client) => {
        await client.db(dbManager.dbName).createIndex(
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
