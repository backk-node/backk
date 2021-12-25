import AbstractSqlDataStore from '../../../AbstractSqlDataStore';
import { DataStore } from '../../../DataStore';

let intervalId: NodeJS.Timeout | undefined = undefined; // NOSONAR
const RETRY_INTERVAL = 15000;

export default async function removeDbInitialization(dataStore: DataStore) {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  if (dataStore instanceof AbstractSqlDataStore) {
    const removeAppVersionSql = `DELETE FROM ${dataStore
      .getSchema()
      .toLowerCase()}.__backk_db_initialization WHERE microserviceversion = ${dataStore.getValuePlaceholder(
      1
    )}`;

    try {
      await dataStore.tryExecuteSqlWithoutCls(removeAppVersionSql, [process.env.MICROSERVICE_VERSION]);
    } catch (error) {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }

      intervalId = setInterval(() => removeDbInitialization(dataStore), RETRY_INTERVAL);
    }
  }
}
