import AbstractSqlDataStore from '../../../AbstractSqlDataStore';

export default async function setDbInitialized(dataStore: AbstractSqlDataStore) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const modifyAppVersionInitializationSql = `UPDATE ${dataStore.getSchema().toLowerCase()}.__backk_db_initialization SET isinitialized = 1 WHERE microserviceversion = ${dataStore.getValuePlaceholder(1)}`;

  await dataStore.tryExecuteSqlWithoutCls(modifyAppVersionInitializationSql, [process.env.MICROSERVICE_VERSION]);
}
