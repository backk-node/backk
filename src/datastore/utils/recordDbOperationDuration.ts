import DataStore from '../DataStore';
import defaultServiceMetrics from '../../observability/metrics/defaultServiceMetrics';

export default function recordDbOperationDuration(dataStore: DataStore, startTimeInMillis: number) {
  const dbOperationProcessingTimeInMillis = Date.now() - startTimeInMillis;
  defaultServiceMetrics.incrementDbOperationProcessingTimeInSecsBucketCounterByOne(
    dataStore.getDataStoreType(),
    dataStore.getDbHost(),
    dbOperationProcessingTimeInMillis / 1000
  );
}
