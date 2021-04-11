import { Meter } from '@opentelemetry/metrics';
declare class DefaultSystemAndNodeJsMetrics {
    private readonly meter;
    private garbageCollectionDurationBucketCounter;
    constructor(meter: Meter);
    startCollectingMetrics(): void;
}
declare const _default: DefaultSystemAndNodeJsMetrics;
export default _default;
