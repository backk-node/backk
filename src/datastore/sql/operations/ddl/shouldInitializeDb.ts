import AbstractSqlDataStore from '../../../AbstractSqlDataStore';

export default async function shouldInitializeDb(dataStore: AbstractSqlDataStore) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const addAppVersionSql = `INSERT INTO ${dataStore.schema.toLowerCase()}.__backk_db_initialization (appVersion, isInitialized, createdattimestamp) VALUES ("${
    process.env.npm_package_version
  }", 0, current_timestamp)`;

  try {
    await dataStore.tryExecuteSqlWithoutCls(addAppVersionSql);
    return true;
  } catch (error) {
    if (dataStore.isDuplicateEntityError(error)) {
      return false;
    }

    throw error;
  }
}
