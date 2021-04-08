import AbstractSqlDbManager from '../../../AbstractSqlDbManager';

export default async function removeDbInitializationWhenPendingTooLong(dbManager: AbstractSqlDbManager) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const removeAppVersionSql = `DELETE FROM ${dbManager.schema.toLowerCase()}.__backk_db_initialization WHERE appversion =
    ${process.env.npm_package_version} AND isinitialized = 0 AND createdattimestamp <= current_timestamp - INTERVAL '5' minute`;

  try {
    await dbManager.tryExecuteSqlWithoutCls(removeAppVersionSql);
  } catch (error) {
    // No operation
  }
}
