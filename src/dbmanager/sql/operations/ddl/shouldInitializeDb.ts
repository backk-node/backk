import AbstractSqlDbManager from '../../../AbstractSqlDbManager';

export default async function shouldInitializeDb(dbManager: AbstractSqlDbManager) {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const addAppVersionSql = `INSERT INTO ${dbManager.schema.toLowerCase()}.__backk_db_initialization (appVersion, isInitialized, createdattimestamp) VALUES ("${
    process.env.npm_package_version
  }", 0, current_timestamp)`;

  try {
    await dbManager.tryExecuteSqlWithoutCls(addAppVersionSql);
    return true;
  } catch (error) {
    if (dbManager.isDuplicateEntityError(error)) {
      return false;
    }

    throw error;
  }
}
