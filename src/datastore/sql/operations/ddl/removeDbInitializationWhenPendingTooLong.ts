import AbstractSqlDataStore from '../../../AbstractSqlDataStore';

export default async function removeDbInitializationWhenPendingTooLong(dataStore: AbstractSqlDataStore) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const removeAppVersionSql = `DELETE FROM ${dataStore.getSchema().toLowerCase()}.__backk_db_initialization WHERE appversion =
    ${process.env.npm_package_version} AND isinitialized = 0 AND createdattimestamp <= current_timestamp - INTERVAL '5' minute`;

  try {
    await dataStore.tryExecuteSqlWithoutCls(removeAppVersionSql);
  } catch (error) {
    // No operation
  }
}
