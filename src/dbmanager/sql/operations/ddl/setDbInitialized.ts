import AbstractSqlDbManager from '../../../AbstractSqlDbManager';

export default async function setDbInitialized(dbManager: AbstractSqlDbManager) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const modifyAppVersionInitializationSql = `UPDATE ${dbManager.schema.toLowerCase()}.__backk_db_initialization SET isinitialized = 1 WHERE appversion = "${
    process.env.npm_package_version
  }"`;

  await dbManager.tryExecuteSqlWithoutCls(modifyAppVersionInitializationSql);
}
