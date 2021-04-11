import { Meter } from '@opentelemetry/metrics';
declare class DefaultServiceMetrics {
    private readonly meter;
    private readonly processingTimeInSecsBuckets;
    private readonly defaultLabels;
    private readonly allServiceFunctionCallCounter;
    private readonly serviceFunctionCallCounter;
    private readonly serviceFunctionCallCacheHitCounter;
    private readonly serviceFunctionCallCachedResponsesCounter;
    private readonly serviceFunctionProcessingTimeCounter;
    private readonly authorizationFailureCounter;
    private readonly http5xxErrorCounter;
    private readonly httpClientErrorCounter;
    private readonly dbOperationErrorCounter;
    private readonly dbFailureDurationInSecsRecorder;
    private readonly dbOperationProcessingTimeCounter;
    private readonly kafkaConsumerErrorCounter;
    private readonly kafkaConsumerRequestTimeoutCounter;
    private readonly kafkaConsumerOffsetLagRecorder;
    private readonly redisConsumerErrorCounter;
    private readonly redisConsumerQueueLengthRecorder;
    private readonly remoteServiceCallCounter;
    private readonly remoteServiceCallErrorCounter;
    private readonly syncRemoteServiceHttp5xxErrorResponseCounter;
    private readonly syncRemoteServiceCallAuthFailureCounter;
    constructor(meter: Meter);
    incrementServiceFunctionCallsByOne(serviceFunction: string): void;
    incrementAuthorizationFailuresByOne(): void;
    incrementHttp5xxErrorsByOne(): void;
    incrementDbOperationErrorsByOne(dbManagerType: string, dbHost: string): void;
    recordDbFailureDurationInSecs(dbManagerType: string, dbHost: string, failureDurationInSecs: number): void;
    incrementServiceFunctionProcessingTimeInSecsBucketCounterByOne(serviceFunction: string, processingTimeInSecs: number): void;
    incrementDbOperationProcessingTimeInSecsBucketCounterByOne(dbManagerType: string, dbHost: string, processingTimeInSecs: number): void;
    incrementKafkaConsumerErrorsByOne(): void;
    incrementKafkaConsumerRequestTimeoutsByOne(): void;
    recordKafkaConsumerOffsetLag(partition: any, offsetLag: number): void;
    incrementRemoteServiceCallCountByOne(remoteServiceUrl: string): void;
    incrementRemoteServiceCallErrorCountByOne(remoteServiceUrl: string): void;
    incrementSyncRemoteServiceHttp5xxErrorResponseCounter(remoteServiceUrl: string): void;
    incrementSyncRemoteServiceCallAuthFailureCounter(remoteServiceUrl: string): void;
    incrementHttpClientErrorCounter(serviceFunction: string): void;
    incrementRedisConsumerErrorCountByOne(): void;
    recordRedisConsumerQueueLength(queueLength: number): void;
    incrementServiceFunctionCallCacheHitCounterByOne(serviceFunction: string): void;
    incrementServiceFunctionCallCachedResponsesCounterByOne(serviceFunction: string): void;
}
declare const _default: DefaultServiceMetrics;
export default _default;
