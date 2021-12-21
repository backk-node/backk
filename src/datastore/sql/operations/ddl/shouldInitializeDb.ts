import AbstractSqlDataStore from '../../../AbstractSqlDataStore';

export default async function shouldInitializeDb(dataStore: AbstractSqlDataStore) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const addAppVersionSql = `INSERT INTO ${dataStore.getSchema().toLowerCase()}.__backk_db_initialization (microserviceversion, isInitialized, createdattimestamp) VALUES (?, 0, current_timestamp)`;

  try {
    await dataStore.tryExecuteSqlWithoutCls(addAppVersionSql, [process.env.MICROSERVICE_VERSION]);
    return true;
  } catch (error) {
    if (dataStore.isDuplicateEntityError(error)) {
      return false;
    }

    throw error;
  }
}
