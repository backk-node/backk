import AbstractDbManager from '../AbstractDbManager';
import defaultServiceMetrics from '../../observability/metrics/defaultServiceMetrics';

export default function recordDbOperationDuration(dbManager: AbstractDbManager, startTimeInMillis: number) {
  const dbOperationProcessingTimeInMillis = Date.now() - startTimeInMillis;
  defaultServiceMetrics.incrementDbOperationProcessingTimeInSecsBucketCounterByOne(
    dbManager.getDbManagerType(),
    dbManager.getDbHost(),
    dbOperationProcessingTimeInMillis / 1000
  );
}
