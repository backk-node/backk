import AbstractDataStore from '../AbstractDataStore';
import defaultServiceMetrics from '../../observability/metrics/defaultServiceMetrics';

export default function recordDbOperationDuration(dataStore: AbstractDataStore, startTimeInMillis: number) {
  const dbOperationProcessingTimeInMillis = Date.now() - startTimeInMillis;
  defaultServiceMetrics.incrementDbOperationProcessingTimeInSecsBucketCounterByOne(
    dataStore.getDataStoreType(),
    dataStore.getDbHost(),
    dbOperationProcessingTimeInMillis / 1000
  );
}
