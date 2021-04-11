"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const tryExecuteServiceMethod_1 = __importDefault(require("../../../execution/tryExecuteServiceMethod"));
const tracerProvider_1 = __importDefault(require("../../../observability/distributedtracinig/tracerProvider"));
const log_1 = __importStar(require("../../../observability/logging/log"));
const api_1 = require("@opentelemetry/api");
const defaultServiceMetrics_1 = __importDefault(require("../../../observability/metrics/defaultServiceMetrics"));
const forEachAsyncParallel_1 = __importDefault(require("../../../utils/forEachAsyncParallel"));
const constants_1 = require("../../../constants/constants");
const sendToRemoteService_1 = __importDefault(require("../sendToRemoteService"));
const getServiceNamespace_1 = __importDefault(require("../../../utils/getServiceNamespace"));
const BackkResponse_1 = __importDefault(require("../../../execution/BackkResponse"));
const wait_1 = __importDefault(require("../../../utils/wait"));
const minimumLoggingSeverityToKafkaLoggingLevelMap_1 = __importDefault(require("./minimumLoggingSeverityToKafkaLoggingLevelMap"));
const logCreator_1 = __importDefault(require("./logCreator"));
async function consumeFromKafka(controller, server, defaultTopic = getServiceNamespace_1.default(), defaultTopicConfig, additionalTopics) {
    var _a, _b, _c, _d;
    if (!server) {
        throw new Error('Kafka server not defined');
    }
    const replicationFactor = process.env.NODE_ENV === 'development'
        ? 1
        : parseInt((_a = process.env.KAFKA_DEFAULT_TOPIC_NUM_PARTITIONS) !== null && _a !== void 0 ? _a : '3', 10);
    const numPartitions = process.env.NODE_ENV === 'development'
        ? 1
        : parseInt((_b = process.env.KAFKA_DEFAULT_TOPIC_NUM_PARTITIONS) !== null && _b !== void 0 ? _b : '3', 10);
    const finalDefaultTopicConfig = defaultTopicConfig !== null && defaultTopicConfig !== void 0 ? defaultTopicConfig : {
        replicationFactor,
        numPartitions,
        configEntries: [
            {
                name: 'retention.ms',
                value: (_c = process.env.KAFKA_DEFAULT_TOPIC_RETENTION_MS) !== null && _c !== void 0 ? _c : (5 * 60 * 1000).toString()
            }
        ]
    };
    const kafkaClient = new kafkajs_1.Kafka({
        clientId: getServiceNamespace_1.default(),
        logLevel: minimumLoggingSeverityToKafkaLoggingLevelMap_1.default[(_d = process.env.LOG_LEVEL) !== null && _d !== void 0 ? _d : 'INFO'],
        brokers: [server],
        logCreator: logCreator_1.default
    });
    const consumer = kafkaClient.consumer({ groupId: getServiceNamespace_1.default() });
    let fetchSpan;
    let hasFetchError = false;
    consumer.on(consumer.events.CRASH, ({ error, ...restOfEvent }) => {
        log_1.default(log_1.Severity.ERROR, 'Kafka consumer error: crashed due to errorMessageOnPreHookFuncExecFailure', error, restOfEvent);
        defaultServiceMetrics_1.default.incrementKafkaConsumerErrorsByOne();
        hasFetchError = true;
        fetchSpan === null || fetchSpan === void 0 ? void 0 : fetchSpan.setStatus({
            code: api_1.CanonicalCode.UNKNOWN,
            message: error
        });
    });
    consumer.on(consumer.events.REQUEST_TIMEOUT, (event) => {
        log_1.default(log_1.Severity.ERROR, 'Kafka consumer error: request to server has timed out', '', event);
        defaultServiceMetrics_1.default.incrementKafkaConsumerRequestTimeoutsByOne();
        hasFetchError = true;
        fetchSpan === null || fetchSpan === void 0 ? void 0 : fetchSpan.setStatus({
            code: api_1.CanonicalCode.UNKNOWN,
            message: 'Consumer request to server has timed out'
        });
    });
    consumer.on(consumer.events.FETCH_START, () => {
        log_1.default(log_1.Severity.DEBUG, 'Kafka consumer debug: started fetch messages from server', '');
        fetchSpan = tracerProvider_1.default.getTracer('default').startSpan('kafkajs.consumer.FETCH_START');
        hasFetchError = false;
        fetchSpan.setAttribute('component', 'kafkajs');
        fetchSpan.setAttribute('span.kind', 'CLIENT');
        fetchSpan.setAttribute('peer.address', server);
    });
    consumer.on(consumer.events.FETCH, (event) => {
        log_1.default(log_1.Severity.DEBUG, 'Kafka consumer debug: finished fetching messages from server', '', event);
        fetchSpan === null || fetchSpan === void 0 ? void 0 : fetchSpan.setAttribute('kafka.consumer.fetch.numberOfBatches', event.numberOfBatches);
        if (!hasFetchError) {
            fetchSpan === null || fetchSpan === void 0 ? void 0 : fetchSpan.setStatus({
                code: api_1.CanonicalCode.OK
            });
        }
        fetchSpan === null || fetchSpan === void 0 ? void 0 : fetchSpan.end();
        fetchSpan = undefined;
    });
    consumer.on(consumer.events.START_BATCH_PROCESS, (event) => {
        log_1.default(log_1.Severity.DEBUG, 'Kafka consumer debug: started processing batch of messages', '', event);
    });
    consumer.on(consumer.events.END_BATCH_PROCESS, (event) => {
        log_1.default(log_1.Severity.DEBUG, 'Kafka consumer debug: finished processing batch of messages', '', event);
        defaultServiceMetrics_1.default.recordKafkaConsumerOffsetLag(event.partition, event.offsetLag);
    });
    consumer.on(consumer.events.COMMIT_OFFSETS, (event) => {
        log_1.default(log_1.Severity.DEBUG, 'Kafka consumer debug: committed offsets', '', event);
    });
    const admin = kafkaClient.admin();
    let hasCreatedDefaultTopic = false;
    while (!hasCreatedDefaultTopic) {
        try {
            await admin.connect();
            const existingTopics = await admin.listTopics();
            if (!existingTopics.includes(defaultTopic)) {
                const didCreateDefaultTopic = await admin.createTopics({
                    topics: [
                        {
                            topic: defaultTopic,
                            ...finalDefaultTopicConfig
                        }
                    ]
                });
                if (didCreateDefaultTopic) {
                    log_1.default(log_1.Severity.INFO, 'Kafka admin client info: created default topic', '', {
                        defaultTopic,
                        ...finalDefaultTopicConfig
                    });
                }
            }
            hasCreatedDefaultTopic = true;
        }
        catch (error) {
            log_1.default(log_1.Severity.ERROR, 'Kafka admin client error: ' + error.message, error.stack, {
                consumerType: 'kafka',
                server
            });
            await wait_1.default(10000);
        }
        finally {
            try {
                await admin.disconnect();
            }
            catch (error) {
            }
        }
    }
    let hasStartedConsumer = false;
    while (!hasStartedConsumer) {
        try {
            await consumer.connect();
            await consumer.subscribe({ topic: defaultTopic });
            await forEachAsyncParallel_1.default(additionalTopics !== null && additionalTopics !== void 0 ? additionalTopics : [], async (topic) => await consumer.subscribe({ topic }));
            await consumer.run({
                eachMessage: async ({ message: { key, value, headers } }) => {
                    var _a;
                    const serviceFunctionName = key.toString();
                    const valueStr = value === null || value === void 0 ? void 0 : value.toString();
                    const serviceFunctionArgument = valueStr ? JSON.parse(valueStr) : null;
                    const response = new BackkResponse_1.default();
                    await tryExecuteServiceMethod_1.default(controller, serviceFunctionName, serviceFunctionArgument, (_a = headers) !== null && _a !== void 0 ? _a : {}, response);
                    if (response.getStatusCode() >= constants_1.HttpStatusCodes.INTERNAL_ERRORS_START) {
                        await wait_1.default(10000);
                        await sendToRemoteService_1.default('kafka://' + server + '/' + defaultTopic + '/' + serviceFunctionName, serviceFunctionArgument);
                    }
                    else if (response.getStatusCode() >= constants_1.HttpStatusCodes.CLIENT_ERRORS_START) {
                        throw new Error(JSON.stringify(response.getResponse()));
                    }
                    else if ((headers === null || headers === void 0 ? void 0 : headers.responseUrl) && response) {
                        await sendToRemoteService_1.default(headers.responseUrl, response);
                    }
                }
            });
            hasStartedConsumer = true;
        }
        catch (error) {
            log_1.default(log_1.Severity.ERROR, 'Kafka consumer error: ' + error.message, error.stack, {
                consumerType: 'kafka',
                server,
                defaultTopic,
                additionalTopics: additionalTopics === null || additionalTopics === void 0 ? void 0 : additionalTopics.join(', ')
            });
            defaultServiceMetrics_1.default.incrementKafkaConsumerErrorsByOne();
            try {
                await consumer.disconnect();
            }
            catch {
            }
            await wait_1.default(10000);
        }
    }
}
exports.default = consumeFromKafka;
//# sourceMappingURL=consumeFromKafka.js.map