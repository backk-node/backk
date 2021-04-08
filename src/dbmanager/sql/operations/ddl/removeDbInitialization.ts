import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import AbstractDbManager from '../../../AbstractDbManager';

let intervalId: NodeJS.Timeout | undefined = undefined; // NOSONAR
const RETRY_INTERVAL = 15000;

export default async function removeDbInitialization(dbManager: AbstractDbManager) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  if (!(dbManager instanceof AbstractSqlDbManager)) {
    const removeAppVersionSql = `DELETE FROM ${dbManager.schema.toLowerCase()}.__backk_db_initialization WHERE appversion =
    ${process.env.npm_package_version}`;

    try {
      await dbManager.tryExecuteSqlWithoutCls(removeAppVersionSql);
    } catch (error) {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }

      intervalId = setInterval(() => removeDbInitialization(dbManager), RETRY_INTERVAL);
    }
  }
}
