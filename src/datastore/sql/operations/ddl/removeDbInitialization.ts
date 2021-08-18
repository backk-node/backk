import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import AbstractDataStore from '../../../AbstractDataStore';

let intervalId: NodeJS.Timeout | undefined = undefined; // NOSONAR
const RETRY_INTERVAL = 15000;

export default async function removeDbInitialization(dataStore: AbstractDataStore) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  if (!(dataStore instanceof AbstractSqlDataStore)) {
    const removeAppVersionSql = `DELETE FROM ${dataStore.schema.toLowerCase()}.__backk_db_initialization WHERE appversion =
    ${process.env.npm_package_version}`;

    try {
      await dataStore.tryExecuteSqlWithoutCls(removeAppVersionSql);
    } catch (error) {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }

      intervalId = setInterval(() => removeDbInitialization(dataStore), RETRY_INTERVAL);
    }
  }
}
